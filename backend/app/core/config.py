from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "L'Éclaireur API"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    
    CORS_ORIGINS: List[str] = ["*"]
    
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    
    SECRET_KEY: str = "votre-cle-secrete-a-changer-en-production"
    
    ARTICLES_PER_PAGE: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
