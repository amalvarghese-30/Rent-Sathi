from fastapi import APIRouter

from .auth import router as auth_router
from .requirements import router as requirements_router
from .properties import router as properties_router
from .matches import router as matches_router
from .admin import router as admin_router
from .complaints import router as complaints_router
from .notifications import router as notifications_router
from .uploads import router as uploads_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
router.include_router(requirements_router)
router.include_router(properties_router)
router.include_router(matches_router)
router.include_router(admin_router)
router.include_router(complaints_router)
router.include_router(notifications_router)
router.include_router(uploads_router)
