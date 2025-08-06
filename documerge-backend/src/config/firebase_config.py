# firebase_config.py
import os
current_script_dir = os.path.dirname(os.path.abspath(__file__))
# Replace with your Firebase project ID
FIREBASE_PROJECT_ID = "documerge-ae4e6"

# Path to your Firebase service account key file
# For local development, download this from Firebase Console -> Project settings -> Service accounts
# For Cloud Run deployment, use GOOGLE_APPLICATION_CREDENTIALS environment variable
# or mount the key file as a secret.
SERVICE_ACCOUNT_KEY_PATH = os.path.join(current_script_dir, "documerge-ae4e6-firebase-adminsdk-fbsvc-5c3e612889.json")

# Storage bucket name (usually your-firebase-project-id.appspot.com)
STORAGE_BUCKET = f"{FIREBASE_PROJECT_ID}.appspot.com"

import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
firebase_admin.initialize_app(cred)

