from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ArticleCategory(str, Enum):
    POLITIQUE = "politique"
    MONDE = "monde"
    ECONOMIE = "economie"
    SCIENCES = "sciences"
    CULTURE = "culture"
    SPORTS = "sports"
    TECH = "tech"

class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ArticleBase(BaseModel):
    title: str
    excerpt: Optional[str] = None
    content: str
    category: ArticleCategory
    image: Optional[str] = None
    tags: Optional[List[str]] = []

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[ArticleCategory] = None
    image: Optional[str] = None
    tags: Optional[List[str]] = None

class AuthorInfo(BaseModel):
    uid: str
    displayName: str
    photoURL: Optional[str] = None

class ArticleResponse(BaseModel):
    id: str
    title: str
    excerpt: Optional[str] = None
    content: str
    category: str
    image: Optional[str] = None
    tags: List[str] = []
    status: str
    author: AuthorInfo
    views: int = 0
    likes: int = 0
    comments_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

class ArticleListResponse(BaseModel):
    articles: List[ArticleResponse]
    total: int
    page: int
    page_size: int

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    content: str
    author_uid: str
    author_name: str
    author_photo: Optional[str] = None
    created_at: Optional[datetime] = None
