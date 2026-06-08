import cloudinary.uploader
from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_DOC_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_DOC_SIZE = 10 * 1024 * 1024  # 10 MB


def _cloudinary_configured() -> bool:
    return bool(settings.cloudinary_cloud_name and
                settings.cloudinary_api_key and
                settings.cloudinary_api_secret and
                settings.cloudinary_cloud_name != "your-cloud-name")


async def upload_image(file_bytes: bytes, public_id: str, folder: str = "rentsaathi/photos") -> dict:
    if not _cloudinary_configured():
        return {"url": "/dev/placeholder-property.jpg", "public_id": public_id}
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=public_id,
        folder=folder,
        resource_type="image",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


async def upload_document(file_bytes: bytes, public_id: str, folder: str = "rentsaathi/documents") -> dict:
    if not _cloudinary_configured():
        return {"url": "/dev/placeholder-doc.pdf", "public_id": public_id}
    result = cloudinary.uploader.upload(
        file_bytes,
        public_id=public_id,
        folder=folder,
        resource_type="auto",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}
