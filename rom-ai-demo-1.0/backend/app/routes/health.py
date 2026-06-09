from fastapi import APIRouter

from app.cloud import cloud_enabled, cloud_root_path
from app.config import settings, write_env_value
from app.schemas import DeepSeekSettingsUpdate, HealthOut, SettingsStatusOut

router = APIRouter()


@router.get("/api/health", response_model=HealthOut)
def health():
    return {
        "status": "ok",
        "service": "rmo-ai-backend",
        "database": "sqlite",
    }


@router.get("/api/settings/status", response_model=SettingsStatusOut)
def settings_status():
    return {
        "deepseek_configured": bool(settings.deepseek_api_key.strip()),
        "deepseek_base_url": settings.deepseek_base_url,
        "deepseek_model": settings.deepseek_model,
        "default_vault_path": settings.default_vault_path,
        "upload_root": str(settings.upload_root_path),
        "cloud_upload_enabled": cloud_enabled(),
        "cloud_upload_root": str(cloud_root_path()) if settings.cloud_upload_root else "",
        "mock_mode": settings.mock_mode,
        "database_url": settings.database_url,
    }


@router.post("/api/settings/deepseek", response_model=SettingsStatusOut)
def update_deepseek_settings(payload: DeepSeekSettingsUpdate):
    settings.deepseek_api_key = payload.api_key.strip()
    settings.deepseek_base_url = payload.base_url.strip() or "https://api.deepseek.com"
    settings.deepseek_model = payload.model.strip() or "deepseek-chat"
    write_env_value("DEEPSEEK_API_KEY", settings.deepseek_api_key)
    write_env_value("DEEPSEEK_BASE_URL", settings.deepseek_base_url)
    write_env_value("DEEPSEEK_MODEL", settings.deepseek_model)
    return settings_status()
