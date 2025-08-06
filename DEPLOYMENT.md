# DocuMerge Deployment Guide

This guide provides step-by-step instructions for deploying the DocuMerge application to Google Cloud Platform and Firebase.

## Prerequisites

Before deploying, ensure you have:

1. **Google Cloud Project** with billing enabled
2. **Firebase Project** (can be the same as GCP project)
3. **Required CLI tools**:
   - Google Cloud SDK (`gcloud`)
   - Firebase CLI (`firebase`)
   - Node.js 18+ and pnpm
   - Docker (for local testing)

## Setup Instructions

### 1. Google Cloud Setup

```bash
# Install Google Cloud SDK (if not already installed)
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Firebase Setup

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Authenticate with Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select the following features:
# - Firestore
# - Storage
# - Hosting
# - Authentication (if not already set up)
```

### 3. Firebase Configuration

#### Enable Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Optionally enable other providers (Google, GitHub, etc.)

#### Configure Firestore
1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Deploy security rules: `firebase deploy --only firestore:rules`

#### Configure Storage
1. Go to Firebase Console → Storage
2. Create a storage bucket
3. Deploy security rules: `firebase deploy --only storage`

### 4. Service Account Setup

Create a service account for backend authentication:

```bash
# Create service account
gcloud iam service-accounts create documerge-backend \
    --display-name="DocuMerge Backend Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:documerge-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

# Create and download service account key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=documerge-backend@$PROJECT_ID.iam.gserviceaccount.com

# Create secret in Google Cloud Secret Manager
gcloud secrets create firebase-service-account \
    --data-file=service-account-key.json
```

## Deployment Process

### Option 1: Automated Deployment (Recommended)

Use the provided deployment scripts:

```bash
# Deploy backend
./deployment/scripts/deploy-backend.sh $PROJECT_ID us-central1

# Deploy frontend (replace with your actual backend URL)
./deployment/scripts/deploy-frontend.sh $PROJECT_ID https://your-backend-url.run.app
```

### Option 2: Manual Deployment

#### Backend Deployment

1. **Build and push Docker image**:
   ```bash
   cd documerge-backend
   gcloud builds submit --tag gcr.io/$PROJECT_ID/documerge-backend
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy documerge-backend \
       --image gcr.io/$PROJECT_ID/documerge-backend \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --memory 1Gi \
       --cpu 1 \
       --max-instances 10 \
       --set-env-vars FLASK_ENV=production
   ```

3. **Configure service account**:
   ```bash
   gcloud run services update documerge-backend \
       --region us-central1 \
       --service-account documerge-backend@$PROJECT_ID.iam.gserviceaccount.com
   ```

#### Frontend Deployment

1. **Update configuration**:
   - Update `src/lib/firebase.js` with your Firebase config
   - Update `src/lib/api.js` with your backend URL

2. **Build and deploy**:
   ```bash
   cd documerge-frontend
   pnpm install
   pnpm run build
   firebase deploy --only hosting
   ```

## Configuration Files

### Backend Configuration

Update `documerge-backend/src/config/firebase_config.py`:

```python
FIREBASE_PROJECT_ID = "your-project-id"
SERVICE_ACCOUNT_KEY_PATH = "/app/service-account-key.json"  # For Cloud Run
STORAGE_BUCKET = "your-project-id.appspot.com"
```

### Frontend Configuration

Update `documerge-frontend/src/lib/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

Update `documerge-frontend/src/lib/api.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.run.app' 
  : 'http://localhost:5000';
```

## Post-Deployment Verification

### 1. Test Backend Health

```bash
curl https://your-backend-url.run.app/api/documents/health
```

Expected response:
```json
{"status": "healthy", "service": "documents"}
```

### 2. Test Frontend

1. Visit your Firebase Hosting URL
2. Create a test account
3. Upload a test document
4. Verify document listing
5. Test document merging

### 3. Monitor Logs

```bash
# Backend logs
gcloud logs tail --service=documerge-backend

# Frontend logs (in Firebase Console)
# Go to Firebase Console → Hosting → View logs
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is properly configured
   - Check that frontend is making requests to correct backend URL

2. **Authentication Failures**
   - Verify Firebase configuration in frontend
   - Check service account permissions in backend

3. **File Upload Issues**
   - Verify Storage bucket exists and has correct permissions
   - Check Storage security rules

4. **Build Failures**
   - Ensure all dependencies are in requirements.txt/package.json
   - Check Docker build logs for specific errors

### Debug Commands

```bash
# Check Cloud Run service status
gcloud run services describe documerge-backend --region us-central1

# View Cloud Run logs
gcloud logs read --service=documerge-backend --limit=50

# Test Firebase rules
firebase emulators:start --only firestore,storage

# Check Firebase project status
firebase projects:list
```

## Security Considerations

1. **Service Account Keys**: Never commit service account keys to version control
2. **Environment Variables**: Use Cloud Run environment variables for sensitive data
3. **CORS Configuration**: Restrict CORS to your frontend domain in production
4. **Firebase Rules**: Ensure Firestore and Storage rules properly restrict access
5. **API Rate Limiting**: Consider implementing rate limiting for production use

## Scaling Considerations

1. **Cloud Run**: Adjust memory, CPU, and max instances based on usage
2. **Firestore**: Monitor read/write operations and optimize queries
3. **Storage**: Consider CDN for frequently accessed files
4. **Monitoring**: Set up Cloud Monitoring alerts for errors and performance

## Cost Optimization

1. **Cloud Run**: Use minimum instances = 0 for cost savings
2. **Storage**: Implement lifecycle policies for old documents
3. **Firestore**: Optimize queries to reduce read operations
4. **Monitoring**: Set up billing alerts to track costs

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Regularly update npm and pip packages
2. **Security Patches**: Monitor for security updates
3. **Backup**: Implement Firestore backup strategy
4. **Monitoring**: Review logs and performance metrics

### Updating the Application

1. **Backend Updates**:
   ```bash
   cd documerge-backend
   # Make changes
   gcloud builds submit --tag gcr.io/$PROJECT_ID/documerge-backend
   gcloud run deploy documerge-backend --image gcr.io/$PROJECT_ID/documerge-backend
   ```

2. **Frontend Updates**:
   ```bash
   cd documerge-frontend
   # Make changes
   pnpm run build
   firebase deploy --only hosting
   ```

## Support

For deployment issues:

1. Check the troubleshooting section above
2. Review Google Cloud and Firebase documentation
3. Check service status pages
4. Contact support if needed

---

**Note**: Replace all placeholder values (your-project-id, your-backend-url, etc.) with your actual project values before deployment.

