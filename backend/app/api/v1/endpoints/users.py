from fastapi import APIRouter, HTTPException, Depends, Query
from app.core.security import get_current_user, get_current_admin, CurrentUser
from app.services.user_service import user_service
from app.schemas.user import (
    UserUpdate, UserResponse, UserRoleUpdate,
    UserListResponse, UserStats, UserPublicResponse
)
from typing import Optional

router = APIRouter()

@router.get("", response_model=UserListResponse)
async def list_users(
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: CurrentUser = Depends(get_current_admin)
):
    users, total = user_service.list_users(
        role=role,
        page=page,
        page_size=page_size
    )
    
    return UserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user)
):
    user = user_service.get_by_uid(current_user.uid)
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return user

@router.get("/me/stats", response_model=UserStats)
async def get_current_user_stats(
    current_user: CurrentUser = Depends(get_current_user)
):
    stats = user_service.get_user_stats(current_user.uid)
    return UserStats(**stats)

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    updated = user_service.update(current_user.uid, user_update)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return updated

@router.get("/{uid}", response_model=UserPublicResponse)
async def get_user_public(uid: str):
    user = user_service.get_by_uid(uid)
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return UserPublicResponse(
        uid=user.uid,
        displayName=user.displayName,
        photoURL=user.photoURL,
        bio=user.bio
    )

@router.put("/{uid}/role", response_model=UserResponse)
async def update_user_role(
    uid: str,
    role_update: UserRoleUpdate,
    current_user: CurrentUser = Depends(get_current_admin)
):
    updated = user_service.update_role(uid, role_update)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return updated

@router.delete("/{uid}")
async def delete_user(
    uid: str,
    current_user: CurrentUser = Depends(get_current_admin)
):
    if uid == current_user.uid:
        raise HTTPException(status_code=400, detail="Impossible de supprimer votre propre compte")
    
    success = user_service.delete(uid)
    
    if not success:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": "Utilisateur supprimé"}
