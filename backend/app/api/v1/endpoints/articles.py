from fastapi import APIRouter, HTTPException, Depends, Query
from app.core.security import get_current_user, get_current_editor, CurrentUser, get_current_user_optional
from app.services.article_service import article_service
from app.schemas.article import (
    ArticleCreate, ArticleUpdate, ArticleResponse, 
    ArticleListResponse, ArticleCategory
)
from typing import Optional

router = APIRouter()

@router.get("", response_model=ArticleListResponse)
async def list_articles(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query("published"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    if status != "published" and (not current_user or not current_user.is_editor):
        status = "published"
    
    articles, total = article_service.list_articles(
        category=category,
        status=status,
        page=page,
        page_size=page_size
    )
    
    return ArticleListResponse(
        articles=articles,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional)
):
    article = article_service.get_by_id(article_id)
    
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if article.status != "published":
        if not current_user or not current_user.is_editor:
            raise HTTPException(status_code=404, detail="Article non trouvé")
    
    article_service.increment_views(article_id)
    
    return article

@router.post("", response_model=ArticleResponse)
async def create_article(
    article: ArticleCreate,
    current_user: CurrentUser = Depends(get_current_editor)
):
    return article_service.create(
        article=article,
        author_uid=current_user.uid,
        author_name=current_user.display_name or current_user.email,
        author_photo=None
    )

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    article: ArticleUpdate,
    current_user: CurrentUser = Depends(get_current_editor)
):
    existing = article_service.get_by_id(article_id)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if existing.author.uid != current_user.uid and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    updated = article_service.update(article_id, article)
    return updated

@router.delete("/{article_id}")
async def delete_article(
    article_id: str,
    current_user: CurrentUser = Depends(get_current_editor)
):
    existing = article_service.get_by_id(article_id)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if existing.author.uid != current_user.uid and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    article_service.delete(article_id)
    return {"message": "Article supprimé"}

@router.post("/{article_id}/publish", response_model=ArticleResponse)
async def publish_article(
    article_id: str,
    current_user: CurrentUser = Depends(get_current_editor)
):
    existing = article_service.get_by_id(article_id)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if existing.author.uid != current_user.uid and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    published = article_service.publish(article_id)
    return published
