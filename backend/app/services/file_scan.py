"""File scanning — ClamAV (tier 1), Cloudinary moderation (tier 2), heuristics (tier 3)."""

from io import BytesIO
from app.core.config import settings


async def _scan_clamav(file_bytes: bytes, filename: str) -> tuple[bool, str]:
    """Tier 1: Scan with ClamAV daemon."""
    try:
        import clamd
        cd = clamd.ClamdNetworkSocket(
            host=settings.clamav_host,
            port=settings.clamav_port,
            timeout=10,
        )
        cd.ping()
        result = cd.instream(BytesIO(file_bytes))
        status, reason = result["stream"]
        if status == "OK":
            return True, "OK"
        return False, reason or "Malware detected by ClamAV"
    except Exception as e:
        return False, f"ClamAV scan failed: {e}"


async def _scan_cloudinary_moderation(file_bytes: bytes, filename: str) -> tuple[bool, str]:
    """Tier 2: Upload to Cloudinary with moderation, then delete if unsafe."""
    try:
        import cloudinary.uploader
        result = cloudinary.uploader.upload(
            BytesIO(file_bytes),
            public_id=f"scan_temp_{filename.replace('.', '_')}",
            resource_type="auto",
            moderation="aws_rek",
            folder="rentsaathi/scan_queue",
        )
        mod_status = result.get("moderation", [{}])
        if mod_status and isinstance(mod_status, list):
            for status in mod_status:
                if status.get("status") == "rejected":
                    # Delete rejected file
                    try:
                        cloudinary.uploader.destroy(result["public_id"])
                    except Exception:
                        pass
                    return False, f"Moderation rejected: {status.get('kind', 'unknown')}"
        # Clean up temp scan file
        try:
            cloudinary.uploader.destroy(result["public_id"])
        except Exception:
            pass
        return True, "OK"
    except Exception as e:
        return False, f"Cloudinary moderation failed: {e}"


def _scan_heuristic(file_bytes: bytes, filename: str) -> tuple[bool, str]:
    """Tier 3: Heuristic checks (extension + magic bytes)."""
    if not filename:
        return False, "No filename"

    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    dangerous_exts = {"exe", "dll", "bat", "cmd", "sh", "vbs", "ps1", "scr", "msi"}
    if ext in dangerous_exts:
        return False, f"Dangerous file extension: .{ext}"

    if len(file_bytes) > 4:
        if file_bytes[:2] == b"MZ":
            return False, "Executable file detected"
        if file_bytes[:4] == b"\x7fELF":
            return False, "Executable file detected"

    return True, "OK"


async def scan_file(file_bytes: bytes, filename: str) -> tuple[bool, str]:
    """
    Scan uploaded file for malware.
    Returns (safe: bool, reason: str).

    Tries ClamAV first, then Cloudinary moderation, then heuristic checks.
    """
    # Tier 1: ClamAV
    if settings.clamav_host:
        safe, reason = await _scan_clamav(file_bytes, filename)
        if safe:
            return True, "OK"
        # If ClamAV fails gracefully (unreachable), fall through to next tier
        if "ClamAV scan failed" in reason or "ping" in reason.lower():
            pass  # fall through
        else:
            return False, reason  # actual malware detection

    # Tier 2: Cloudinary moderation
    if (settings.cloudinary_cloud_name and
        settings.cloudinary_cloud_name != "your-cloud-name"):
        safe, reason = await _scan_cloudinary_moderation(file_bytes, filename)
        if safe:
            return True, "OK"
        if "Cloudinary moderation failed" in reason:
            pass  # fall through
        else:
            return False, reason  # actual rejection

    # Tier 3: Heuristic fallback
    return _scan_heuristic(file_bytes, filename)
