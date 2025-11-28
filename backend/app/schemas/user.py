from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    VISITOR = "visitor"
    EDITOR = "editor"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: str
    displayName: Optional[str] = None
    photoURL: Optional[str] = None

class UserCreate(UserBase):
    uid: str

class UserUpdate(BaseModel):
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    bio: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserResponse(BaseModel):
    uid: str
    email: str
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    role: str = "visitor"
    bio: Optional[str] = None
    created_at: Optional[datetime] = None

class UserPublicResponse(BaseModel):
    uid: str
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    bio: Optional[str] = None

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int

class UserStats(BaseModel):
    articles_count: int = 0
    published_articles: int = 0
    total_views: int = 0
    total_likes: int = 0
    total_comments: int = 0

class DashboardStats(BaseModel):
    total_users: int = 0
    total_articles: int = 0
    total_published: int = 0
    total_views: int = 0
    users_by_role: dict = {}
    articles_by_category: dict = {}
