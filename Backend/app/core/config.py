from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Platziflix"
    version: str = "0.1.0"
    database_url: str = "postgresql://user:password@localhost:5432/platziflix"
    secret_key: str = "your-secret-key-change-this-in-production-use-openssl-rand-hex-32"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
