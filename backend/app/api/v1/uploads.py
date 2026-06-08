from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request, status
from app.core.deps import get_current_user
from app.models.user import User
from app.middleware.rate_limit import limiter, UPLOAD_LIMIT
from app.services.upload import (
    upload_image,
    upload_document,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_DOC_TYPES,
    MAX_IMAGE_SIZE,
    MAX_DOC_SIZE,
)
from app.services.file_scan import scan_file
import uuid
import mimetypes

router = APIRouter(prefix="/uploads", tags=["uploads"])


async def validate_upload(file: UploadFile, allowed_types: set, max_size: int):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    content = await file.read()

    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max {max_size // (1024*1024)}MB",
        )

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0]
    if mime_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {mime_type}. Allowed: {', '.join(allowed_types)}",
        )

    # Malware scan
    safe, scan_reason = await scan_file(content, file.filename)
    if not safe:
        raise HTTPException(status_code=400, detail=f"File rejected: {scan_reason}")

    # Reset file position for upload
    from io import BytesIO
    return BytesIO(content), mime_type


@router.post("/property-image")
@limiter.limit(UPLOAD_LIMIT)
async def upload_property_image(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    if user.role not in ("broker", "admin"):
        raise HTTPException(status_code=403, detail="Only brokers can upload property images")

    file_bytes, mime_type = await validate_upload(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
    public_id = f"property_{uuid.uuid4().hex[:12]}"
    result = await upload_image(file_bytes.getvalue(), public_id)
    return {"url": result["url"], "public_id": result["public_id"]}


@router.post("/kyc-document")
@limiter.limit(UPLOAD_LIMIT)
async def upload_kyc_document(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    file_bytes, mime_type = await validate_upload(file, ALLOWED_DOC_TYPES, MAX_DOC_SIZE)
    public_id = f"kyc_{uuid.uuid4().hex[:12]}"
    result = await upload_document(file_bytes.getvalue(), public_id)
    return {"url": result["url"], "public_id": result["public_id"]}


@router.post("/broker-document")
@limiter.limit(UPLOAD_LIMIT)
async def upload_broker_document(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    if user.role != "broker":
        raise HTTPException(status_code=403, detail="Only brokers can upload verification documents")

    file_bytes, mime_type = await validate_upload(file, ALLOWED_DOC_TYPES, MAX_DOC_SIZE)
    public_id = f"broker_doc_{uuid.uuid4().hex[:12]}"
    result = await upload_document(file_bytes.getvalue(), public_id)
    return {"url": result["url"], "public_id": result["public_id"]}
