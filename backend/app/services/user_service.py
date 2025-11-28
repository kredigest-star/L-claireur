from app.core.firebase import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserRoleUpdate
from typing import Optional, List
from datetime import datetime
from google.cloud.firestore_v1 import FieldFilter

class UserService:
    def __init__(self):
        self.db = get_db()
        self.collection = "users"
    
    def create_or_update(self, user: UserCreate) -> UserResponse:
        doc_ref = self.db.collection(self.collection).document(user.uid)
        doc = doc_ref.get()
        
        if doc.exists:
            doc_ref.update({
                "last_login": datetime.utcnow()
            })
            data = doc_ref.get().to_dict()
        else:
            data = {
                "uid": user.uid,
                "email": user.email,
                "displayName": user.displayName,
                "photoURL": user.photoURL,
                "role": "visitor",
                "bio": None,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            doc_ref.set(data)
        
        return self._to_response(data)
    
    def get_by_uid(self, uid: str) -> Optional[UserResponse]:
        doc = self.db.collection(self.collection).document(uid).get()
        if not doc.exists:
            return None
        return self._to_response(doc.to_dict())
    
    def update(self, uid: str, user: UserUpdate) -> Optional[UserResponse]:
        doc_ref = self.db.collection(self.collection).document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        update_data = {k: v for k, v in user.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        return self._to_response(updated_doc.to_dict())
    
    def update_role(self, uid: str, role_update: UserRoleUpdate) -> Optional[UserResponse]:
        doc_ref = self.db.collection(self.collection).document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        doc_ref.update({
            "role": role_update.role.value,
            "updated_at": datetime.utcnow()
        })
        
        updated_doc = doc_ref.get()
        return self._to_response(updated_doc.to_dict())
    
    def delete(self, uid: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.delete()
        return True
    
    def list_users(self, role: str = None, page: int = 1, page_size: int = 10) -> tuple:
        query = self.db.collection(self.collection)
        
        if role:
            query = query.where(filter=FieldFilter("role", "==", role))
        
        query = query.order_by("created_at", direction="DESCENDING")
        
        all_docs = list(query.stream())
        total = len(all_docs)
        
        start = (page - 1) * page_size
        end = start + page_size
        page_docs = all_docs[start:end]
        
        users = [self._to_response(doc.to_dict()) for doc in page_docs]
        
        return users, total
    
    def get_user_stats(self, uid: str) -> dict:
        articles = self.db.collection("articles").where(
            filter=FieldFilter("author_uid", "==", uid)
        ).stream()
        
        articles_list = list(articles)
        total_articles = len(articles_list)
        published = sum(1 for a in articles_list if a.to_dict().get("status") == "published")
        total_views = sum(a.to_dict().get("views", 0) for a in articles_list)
        total_likes = sum(a.to_dict().get("likes", 0) for a in articles_list)
        
        return {
            "articles_count": total_articles,
            "published_articles": published,
            "total_views": total_views,
            "total_likes": total_likes
        }
    
    def _to_response(self, data: dict) -> UserResponse:
        return UserResponse(
            uid=data.get("uid", ""),
            email=data.get("email", ""),
            displayName=data.get("displayName"),
            photoURL=data.get("photoURL"),
            role=data.get("role", "visitor"),
            bio=data.get("bio"),
            created_at=data.get("created_at")
        )

user_service = UserService()
