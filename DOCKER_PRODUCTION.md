# Docker Production Guide

Complete guide for Docker-based production deployment of SoloSuccess Intel Academy.

## Overview

This project uses Docker for containerized deployment with:
- Multi-stage builds for optimized images
- Non-root users for security
- Health checks for monitoring
- Production-optimized configurations

## Docker Architecture

### Backend Container
- **Base Image**: `node:18-alpine`
- **Build Stage**: Installs dependencies, builds TypeScript
- **Production Stage**: Only production dependencies, runs as non-root user
- **Port**: 3000
- **Health Check**: `/api/health`

### Frontend Container
- **Base Image**: `nginx:alpine`
- **Build Stage**: Builds React application with Vite
- **Production Stage**: Serves static files with Nginx
- **Port**: 80
- **Health Check**: `/health`

## Building Docker Images

### Backend

```bash
cd backend
docker build -t solosuccess-backend:latest -f Dockerfile .
```

### Frontend

```bash
cd frontend
docker build -t solosuccess-frontend:latest -f Dockerfile .
```

### Build with Build Arguments

```bash
# Frontend with API URL
docker build \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api \
  -t solosuccess-frontend:latest \
  -f frontend/Dockerfile \
  frontend/
```

## Running with Docker Compose

### Production Compose

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Environment Variables

Create `.env` file in project root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=solosuccess_academy

# Redis
REDIS_PASSWORD=your-redis-password

# Backend
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
YOUTUBE_API_KEY=your-youtube-key
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
COOKIE_DOMAIN=.yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Dockerfile Details

### Backend Dockerfile

**Multi-Stage Build:**
1. **Builder Stage**: Installs all dependencies, builds TypeScript
2. **Production Stage**: Only production dependencies, smaller image

**Security Features:**
- Non-root user (nodejs:1001)
- Minimal base image (alpine)
- No dev dependencies in production
- Proper file permissions

**Optimizations:**
- Layer caching for dependencies
- Separate Prisma Client generation
- npm cache cleanup
- dumb-init for signal handling

### Frontend Dockerfile

**Multi-Stage Build:**
1. **Builder Stage**: Builds React application
2. **Production Stage**: Nginx serves static files

**Security Features:**
- Non-root user (nginx)
- Minimal base image (alpine)
- Security headers in nginx config
- Hidden nginx version

**Optimizations:**
- Gzip compression
- Static asset caching
- SPA routing support
- Health check endpoint

## Image Optimization

### Image Size Reduction

**Current Sizes** (approximate):
- Backend: ~150MB
- Frontend: ~50MB

**Optimization Tips:**
1. Use `.dockerignore` to exclude unnecessary files
2. Multi-stage builds reduce final image size
3. Alpine Linux base images are smaller
4. Remove build dependencies in production stage
5. Clean npm cache after install

### Build Cache

Docker uses layer caching to speed up builds:

```bash
# Build with cache
docker build --cache-from solosuccess-backend:latest -t solosuccess-backend:latest .

# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t solosuccess-backend:latest .
```

## Health Checks

### Backend Health Check

```bash
# Manual check
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "rss": "150 MB",
    "heapUsed": "80 MB",
    "heapTotal": "120 MB"
  },
  "database": "connected",
  "redis": "connected"
}
```

### Frontend Health Check

```bash
# Manual check
curl http://localhost/health

# Expected response
healthy
```

### Docker Health Check

Docker automatically runs health checks:

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' container-name
```

## Security Best Practices

### 1. Non-Root Users

Both containers run as non-root users:
- Backend: `nodejs` (UID 1001)
- Frontend: `nginx` (system user)

### 2. Minimal Base Images

Using Alpine Linux reduces attack surface:
- Smaller image size
- Fewer packages
- Less attack surface

### 3. Secrets Management

Never include secrets in Dockerfiles:
- Use environment variables
- Use Docker secrets (Docker Swarm)
- Use external secret management (Render, Kubernetes)

### 4. Image Scanning

Scan images for vulnerabilities:

```bash
# Using Trivy
trivy image solosuccess-backend:latest

# Using Docker Scout
docker scout cves solosuccess-backend:latest
```

### 5. .dockerignore

Exclude sensitive files:
- `.env` files
- `node_modules`
- Git files
- Documentation
- Test files

## Production Deployment

### Render Deployment

Render automatically builds and deploys using Dockerfiles:
1. Detects Dockerfile in service configuration
2. Builds image on each deployment
3. Runs container with health checks
4. Monitors and restarts if needed

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for details.

### Manual Deployment

1. **Build Images**
   ```bash
   docker build -t solosuccess-backend:latest -f backend/Dockerfile backend/
   docker build -t solosuccess-frontend:latest -f frontend/Dockerfile frontend/
   ```

2. **Tag for Registry**
   ```bash
   docker tag solosuccess-backend:latest registry.example.com/solosuccess-backend:latest
   docker tag solosuccess-frontend:latest registry.example.com/solosuccess-frontend:latest
   ```

3. **Push to Registry**
   ```bash
   docker push registry.example.com/solosuccess-backend:latest
   docker push registry.example.com/solosuccess-frontend:latest
   ```

4. **Deploy**
   ```bash
   docker pull registry.example.com/solosuccess-backend:latest
   docker run -d --name backend -p 3000:3000 \
     -e DATABASE_URL=... \
     -e REDIS_URL=... \
     registry.example.com/solosuccess-backend:latest
   ```

## Troubleshooting

### Build Issues

**Issue**: Build fails with "package not found"
- **Solution**: Check package.json includes all dependencies
- Verify .dockerignore doesn't exclude package.json

**Issue**: Build is slow
- **Solution**: Use build cache
- Optimize Dockerfile layer order
- Use BuildKit

**Issue**: Image size is too large
- **Solution**: Use multi-stage builds
- Remove dev dependencies
- Use .dockerignore
- Use Alpine base images

### Runtime Issues

**Issue**: Container exits immediately
- **Solution**: Check logs: `docker logs container-name`
- Verify environment variables
- Check health check configuration

**Issue**: Health check fails
- **Solution**: Verify health check endpoint works
- Check network connectivity
- Verify dependencies (database, Redis)

**Issue**: Permission denied errors
- **Solution**: Check file permissions
- Verify non-root user has access
- Check volume mounts

## Monitoring

### Container Logs

```bash
# View logs
docker logs container-name

# Follow logs
docker logs -f container-name

# Last 100 lines
docker logs --tail 100 container-name
```

### Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats container-name
```

### Health Status

```bash
# Check health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Detailed health
docker inspect --format='{{json .State.Health}}' container-name
```

## Maintenance

### Updating Images

1. **Rebuild**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Restart**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Rollback**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cleaning Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything
docker system prune -a
```

## Best Practices

1. **Always use multi-stage builds** for smaller images
2. **Run as non-root** for security
3. **Use health checks** for monitoring
4. **Keep images updated** with security patches
5. **Scan images** for vulnerabilities
6. **Use .dockerignore** to exclude unnecessary files
7. **Optimize layer caching** for faster builds
8. **Document Dockerfile changes** in commits
9. **Test locally** before deploying
10. **Monitor resource usage** in production

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
- [Production Environment Variables](./PRODUCTION_ENV.md)

