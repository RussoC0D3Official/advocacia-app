import firebase_admin
from firebase_admin import credentials, auth, storage, firestore
import os
from src.config.firebase_config import FIREBASE_PROJECT_ID, SERVICE_ACCOUNT_KEY_PATH, STORAGE_BUCKET

class FirebaseService:
    def __init__(self):
        self.app = None
        self.bucket = None
        self.db = None
        self.initialize_firebase()
    
    def initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app is already initialized
            self.app = firebase_admin.get_app()
        except ValueError:
            # App not initialized, so initialize it
            try:
                # Try to initialize with service account key for local development
                if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
                    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
                    self.app = firebase_admin.initialize_app(cred, {
                        'storageBucket': STORAGE_BUCKET
                    })
                else:
                    # Use default credentials (for Cloud Run or when GOOGLE_APPLICATION_CREDENTIALS is set)
                    self.app = firebase_admin.initialize_app(options={
                        'storageBucket': STORAGE_BUCKET
                    })
            except Exception as e:
                print(f"Error initializing Firebase: {e}")
                print("Running in development mode without Firebase")
                # For development without Firebase, we'll create a mock service
                self.app = None
        
        # Only initialize Firebase services if app was successfully created
        if self.app:
            try:
                self.bucket = storage.bucket()
                self.db = firestore.client()
            except Exception as e:
                print(f"Error initializing Firebase services: {e}")
                print("Firebase services not available - running in mock mode")
                self.bucket = None
                self.db = None
        else:
            self.bucket = None
            self.db = None
    
    def verify_token(self, id_token):
        """Verify Firebase ID token"""
        if not self.app:
            return None
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def upload_file(self, file_stream, filename, user_id=None):
        """Upload file to Firebase Storage"""
        if not self.bucket:
            # Mock implementation for development
            print(f"Mock: Would upload file {filename} for user {user_id}")
            return f"users/{user_id}/{filename}" if user_id else filename
        
        try:
            # Create user-specific path if user_id provided
            blob_path = f"users/{user_id}/{filename}" if user_id else filename
            blob = self.bucket.blob(blob_path)
            blob.upload_from_file(file_stream)
            return blob_path
        except Exception as e:
            print(f"File upload error: {e}")
            return None
    
    def download_file(self, blob_path):
        """Download file from Firebase Storage"""
        if not self.bucket:
            # Mock implementation for development
            print(f"Mock: Would download file {blob_path}")
            return None
        
        try:
            blob = self.bucket.blob(blob_path)
            return blob.download_as_bytes()
        except Exception as e:
            print(f"File download error: {e}")
            return None
    
    def list_user_files(self, user_id):
        """List files for a specific user"""
        if not self.bucket:
            # Mock implementation for development
            print(f"Mock: Would list files for user {user_id}")
            return [
                {
                    'name': 'sample_document1.docx',
                    'path': f'users/{user_id}/sample_document1.docx',
                    'size': 12345,
                    'updated': '2024-01-01T00:00:00Z'
                },
                {
                    'name': 'sample_document2.docx',
                    'path': f'users/{user_id}/sample_document2.docx',
                    'size': 23456,
                    'updated': '2024-01-02T00:00:00Z'
                }
            ]
        
        try:
            blobs = self.bucket.list_blobs(prefix=f"users/{user_id}/")
            return [{'name': blob.name.split('/')[-1], 'path': blob.name, 'size': blob.size, 'updated': blob.updated} for blob in blobs]
        except Exception as e:
            print(f"Error listing files: {e}")
            return []
    
    def save_document_metadata(self, user_id, filename, blob_path):
        """Save document metadata to Firestore"""
        if not self.db:
            # Mock implementation for development
            print(f"Mock: Would save metadata for {filename} at {blob_path} for user {user_id}")
            return "mock_doc_id_123"
        
        try:
            doc_ref = self.db.collection('documents').add({
                'user_id': user_id,
                'filename': filename,
                'blob_path': blob_path,
                'created_at': firestore.SERVER_TIMESTAMP
            })
            return doc_ref[1].id
        except Exception as e:
            print(f"Error saving metadata: {e}")
            return None

# Global instance
firebase_service = FirebaseService()

