from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'SentinelAI'
    backend_host: str = '0.0.0.0'
    backend_port: int = 8000
    backend_reload: bool = True
    database_url: str = 'sqlite:///./backend/data/sentinelai.db'
    upload_dir: str = 'backend/data/uploads'
    auth_secret: str
    cors_origins: str = (
        'http://localhost:3000,http://127.0.0.1:3000,'
        'http://localhost:3001,http://127.0.0.1:3001,'
        'http://localhost:3002,http://127.0.0.1:3002,'
        'http://localhost:3003,http://127.0.0.1:3003'
    )

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    @property
    def upload_path(self) -> Path:
        return Path(self.upload_dir)

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(',') if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

