from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="L'Éclaireur API",
    description="API pour la plateforme de presse L'Éclaireur",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Bienvenue sur L'Éclaireur API", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "L'Éclaireur API"}
