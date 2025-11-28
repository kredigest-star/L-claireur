from fastapi import APIRouter, HTTPException, Depends
from app.core.security import get_current_user, CurrentUser
from app.core.firebase import verify_firebase_token
from app.services.user_service import user_service
from app.schemas.user import UserCreate, UserResponse
from pydantic import BaseModel

router = APIRouter()

class TokenRequest(BaseModel):
    token: str

class LoginResponse(BaseModel):
    user: UserResponse
    message: str

@router.post("/login", response_model=LoginResponse)
async def login(request: TokenRequest):
    decoded = verify_firebase_token(request.token)
    
    if not decoded:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user_data = UserCreate(
        uid=decoded.get("uid"),
        email=decoded.get("email", ""),
        displayName=decoded.get("name"),
        photoURL=decoded.get("picture")
    )
    
    user = user_service.create_or_update(user_data)
    
    return LoginResponse(
        user=user,
        message="Connexion réussie"
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser = Depends(get_current_user)):
    user = user_service.get_by_uid(current_user.uid)
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return user

@router.post("/logout")
async def logout(current_user: CurrentUser = Depends(get_current_user)):
    return {"message": "Déconnexion réussie"}
