"""
# RevCraft — Application Configuration
Loads settings from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # --- Database ---
    database_url: str = "postgresql+psycopg://revcraft:revcraft_pass@localhost:5433/revcraft"

    # --- AWS S3 ---
    aws_access_key_id: str = "test"
    aws_secret_access_key: str = "test"
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "revcraft-data-lake"
    s3_endpoint_url: Optional[str] = "http://localhost:4566"

    # --- AWS Redshift ---
    redshift_host: Optional[str] = None
    redshift_port: int = 5439
    redshift_db: str = "revcraft_analytics"
    redshift_user: Optional[str] = None
    redshift_password: Optional[str] = None

    # --- OpenAI ---
    openai_api_key: Optional[str] = None

    # --- Auth ---
    jwt_secret_key: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440

    # --- App ---
    cors_origins: str = "http://localhost:3000"

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
