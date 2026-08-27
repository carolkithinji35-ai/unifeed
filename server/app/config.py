import os

from dotenv import load_dotenv


load_dotenv()


class Config:
    """Application settings loaded from environment variables."""

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/unifeed_dev",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
