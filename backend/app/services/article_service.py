from app.core.firebase import get_db
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, AuthorInfo
from typing import Optional, List
from datetime import datetime
from google.cloud.firestore_v1 import FieldFilter

class ArticleService:
    def __init__(self):
        self.db = get_db()
        self.collection = "articles"
    
    def create(self, article: ArticleCreate, author_uid: str, author_name: str, author_photo: str = None) -> ArticleResponse:
        doc_ref = self.db.collection(self.collection).document()
        
        data = {
            "title": article.title,
            "excerpt": article.excerpt,
            "content": article.content,
            "category": article.category.value,
            "image": article.image,
            "tags": article.tags or [],
            "status": "draft",
            "author_uid": author_uid,
            "author_name": author_name,
            "author_photo": author_photo,
            "views": 0,
            "likes": 0,
            "comments_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "published_at": None
        }
        
        doc_ref.set(data)
        return self._to_response(doc_ref.id, data)
    
    def get_by_id(self, article_id: str) -> Optional[ArticleResponse]:
        doc = self.db.collection(self.collection).document(article_id).get()
        if not doc.exists:
            return None
        return self._to_response(doc.id, doc.to_dict())
    
    def update(self, article_id: str, article: ArticleUpdate) -> Optional[ArticleResponse]:
        doc_ref = self.db.collection(self.collection).document(article_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        update_data = {k: v for k, v in article.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if "category" in update_data:
            update_data["category"] = update_data["category"].value
        
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        return self._to_response(updated_doc.id, updated_doc.to_dict())
    
    def delete(self, article_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(article_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.delete()
        return True
    
    def list_articles(self, category: str = None, status: str = "published", page: int = 1, page_size: int = 10) -> tuple:
        query = self.db.collection(self.collection)
        
        if status:
            query = query.where(filter=FieldFilter("status", "==", status))
        
        if category:
            query = query.where(filter=FieldFilter("category", "==", category))
        
        query = query.order_by("created_at", direction="DESCENDING")
        
        all_docs = list(query.stream())
        total = len(all_docs)
        
        start = (page - 1) * page_size
        end = start + page_size
        page_docs = all_docs[start:end]
        
        articles = [self._to_response(doc.id, doc.to_dict()) for doc in page_docs]
        
        return articles, total
    
    def publish(self, article_id: str) -> Optional[ArticleResponse]:
        doc_ref = self.db.collection(self.collection).document(article_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        doc_ref.update({
            "status": "published",
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        updated_doc = doc_ref.get()
        return self._to_response(updated_doc.id, updated_doc.to_dict())
    
    def increment_views(self, article_id: str):
        doc_ref = self.db.collection(self.collection).document(article_id)
        doc_ref.update({"views": self.db.field_value.increment(1)})
    
    def _to_response(self, doc_id: str, data: dict) -> ArticleResponse:
        return ArticleResponse(
            id=doc_id,
            title=data.get("title", ""),
            excerpt=data.get("excerpt"),
            content=data.get("content", ""),
            category=data.get("category", ""),
            image=data.get("image"),
            tags=data.get("tags", []),
            status=data.get("status", "draft"),
            author=AuthorInfo(
                uid=data.get("author_uid", ""),
                displayName=data.get("author_name", ""),
                photoURL=data.get("author_photo")
            ),
            views=data.get("views", 0),
            likes=data.get("likes", 0),
            comments_count=data.get("comments_count", 0),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
            published_at=data.get("published_at")
        )

article_service = ArticleService()
