# DocuMerge Docker Setup

This guide explains how to run the DocuMerge application using Docker Compose for local development and testing.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- 2GB of available disk space

## Quick Start

### 1. Build and Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 2. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/api/documents/health

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

## Service Architecture

### Backend Service (`backend`)
- **Image**: Python 3.9-slim
- **Port**: 5000
- **Features**:
  - Flask API server
  - SQLite database (persisted in volume)
  - Document processing with python-docx
  - Firebase integration
  - CORS enabled for frontend communication

### Frontend Service (`frontend`)
- **Image**: Node.js 18-alpine
- **Port**: 5173
- **Features**:
  - React application with Vite
  - Hot reload for development
  - TailwindCSS styling
  - shadcn/ui components
  - Firebase authentication

### Firebase Emulator (Optional)
- **Ports**: 
  - 9099 (Auth)
  - 8080 (Firestore)
  - 9199 (Storage)
  - 4000 (UI)
- **Usage**: Run with `docker-compose --profile emulator up`

## Development Workflow

### 1. Code Changes
The application uses volume mounts, so code changes are reflected immediately:
- Backend changes: Flask auto-reloads
- Frontend changes: Vite hot reloads

### 2. Database Persistence
The SQLite database is persisted in a Docker volume (`backend_data`), so data survives container restarts.

### 3. Dependencies
- **Backend**: Dependencies are installed during build
- **Frontend**: Dependencies are cached in volumes for faster rebuilds

## Useful Commands

### Service Management
```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose build frontend
```

### Development
```bash
# Access backend container
docker-compose exec backend bash

# Access frontend container
docker-compose exec frontend sh

# View real-time logs
docker-compose logs -f backend
```

### Cleanup
```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (WARNING: This will delete database data)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Configuration

### Environment Variables

#### Backend
- `FLASK_ENV`: Set to `development` for debug mode
- `FLASK_DEBUG`: Enable Flask debug mode
- `PYTHONPATH`: Python path configuration

#### Frontend
- `NODE_ENV`: Set to `development`
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

### Volumes
- `backend_data`: Persists SQLite database
- `firebase_emulator_data`: Persists Firebase emulator data (when using emulator)

### Networks
- `documerge-network`: Internal network for service communication

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5000
sudo lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

#### 2. Build Failures
```bash
# Clean build cache
docker-compose build --no-cache

# Remove all images and rebuild
docker-compose down --rmi all
docker-compose up --build
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ./documerge-backend
sudo chown -R $USER:$USER ./documerge-frontend
```

#### 4. Database Issues
```bash
# Reset database
docker-compose down
docker volume rm documerge-complete-project_backend_data
docker-compose up --build
```

### Performance Optimization

#### 1. Faster Builds
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1
docker-compose build
```

#### 2. Resource Limits
Add to docker-compose.yml services:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
```

## Production Considerations

### Security
- Change default Flask secret key
- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure proper CORS settings

### Performance
- Use multi-stage builds for smaller images
- Implement proper caching strategies
- Use production-grade database (PostgreSQL/MySQL)
- Configure proper logging

### Monitoring
- Add health checks to services
- Implement proper logging
- Use monitoring tools (Prometheus, Grafana)

## Firebase Integration

### Local Development with Emulator
```bash
# Start with Firebase emulator
docker-compose --profile emulator up

# Access Firebase emulator UI
# http://localhost:4000
```

### Production Setup
1. Configure Firebase project
2. Update service account credentials
3. Set environment variables
4. Configure security rules

## Support

For issues related to:
- **Docker**: Check Docker documentation
- **Application**: Check the main README.md
- **Firebase**: Check Firebase documentation

## Contributing

When making changes:
1. Test with Docker setup
2. Update this documentation if needed
3. Ensure backward compatibility
4. Follow Docker best practices 