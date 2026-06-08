import secrets
from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "rentsaathi"

    # JWT
    jwt_secret_key: str = ""  # MUST be set in production
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Cloudinary
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # Resend
    resend_api_key: Optional[str] = None
    email_from: str = "RentSaathi <noreply@rentsaathi.com>"

    # Frontend / CORS
    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = ""  # comma-separated list of additional allowed origins

    # ClamAV
    clamav_host: Optional[str] = None
    clamav_port: int = 3310

    # Redis
    redis_url: Optional[str] = None  # "redis://localhost:6379/0"

    # Sentry
    sentry_dsn: Optional[str] = None

    # Dev Admin Seed
    dev_admin_email: str = "amalvarghese113112@gmail.com"
    dev_admin_password: str = "admin123"

    # Environment
    environment: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def get_allowed_origins(self) -> list[str]:
        origins = [self.frontend_url]
        if self.allowed_origins:
            origins.extend(url.strip() for url in self.allowed_origins.split(",") if url.strip())
        return origins

    def validate_secret(self):
        if self.environment == "production":
            if not self.jwt_secret_key:
                raise ValueError(
                    "JWT_SECRET_KEY is not set. Generate one with: python -c "
                    "'import secrets; print(secrets.token_urlsafe(64))'"
                )
            if len(self.jwt_secret_key) < 32:
                raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production")


settings = Settings()

# Auto-generate dev key so developers don't need .env to get started
if not settings.jwt_secret_key and settings.environment == "development":
    settings.jwt_secret_key = secrets.token_urlsafe(64)
    print(f"[DEV] Generated JWT_SECRET_KEY: {settings.jwt_secret_key[:8]}...")
