from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/lostandfound"
    SECRET_KEY: str = "supersecretkeythatyoushouldchange"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_EMAIL_DOMAIN: str = "college.edu"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
