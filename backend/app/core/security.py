from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.firebase import verify_firebase_token, get_db
from typing import Optional
from enum import Enum

security = HTTPBearer(auto_error=False)

class UserRole(str, Enum):
    VISITOR = "visitor"
    EDITOR = "editor"
    ADMIN = "admin"

class CurrentUser:
    def __init__(self, uid: str, email: str, role: str, display_name: str = None):
        self.uid = uid
        self.email = email
        self.role = role
        self.display_name = display_name
    
    @property
    def is_editor(self) -> bool:
        return self.role in [UserRole.EDITOR, UserRole.ADMIN]
    
    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> CurrentUser:
    if not credentials:
        raise HTTPException(status_code=401, detail="Token manquant")
    
    token = credentials.credentials
    decoded = verify_firebase_token(token)
    
    if not decoded:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    uid = decoded.get("uid")
    email = decoded.get("email", "")
    
    db = get_db()
    role = UserRole.VISITOR
    display_name = decoded.get("name", "")
    
    if db:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            role = user_data.get("role", UserRole.VISITOR)
            display_name = user_data.get("displayName", display_name)
    
    return CurrentUser(uid=uid, email=email, role=role, display_name=display_name)

async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Optional[CurrentUser]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None

async def get_current_editor(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    if not current_user.is_editor:
        raise HTTPException(status_code=403, detail="Accès éditeur requis")
    return current_user

async def get_current_admin(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return current_user
