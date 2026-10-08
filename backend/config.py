import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "MultiStream AI"
    VERSION: str = "1.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://mock-supabase.multistream.internal")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-anon")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Vector Search & LLM
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    # Dataset configurations
    EPFL_RLC_DATASET_ROOT: str = os.getenv("EPFL_RLC_DATASET_ROOT", r"C:\Users\natar\Downloads\EPFL-RLC_dataset\EPFL-RLC_dataset")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()
