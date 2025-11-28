import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings
from typing import Optional

db = None

def init_firebase():
    global db
    try:
        if settings.FIREBASE_CREDENTIALS_PATH:
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
        db = firestore.client()
        print("Firebase initialisé avec succès")
    except Exception as e:
        print(f"Erreur initialisation Firebase: {e}")
        db = None

def get_db():
    global db
    if db is None:
        init_firebase()
    return db

def verify_firebase_token(token: str) -> Optional[dict]:
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        print(f"Erreur vérification token: {e}")
        return None

def get_user_by_uid(uid: str) -> Optional[dict]:
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url
        }
    except Exception:
        return None
