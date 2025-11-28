from fastapi import APIRouter
from app.api.v1.endpoints import articles, users, auth

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentification"]
)

api_router.include_router(
    articles.router,
    prefix="/articles",
    tags=["Articles"]
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Utilisateurs"]
)
