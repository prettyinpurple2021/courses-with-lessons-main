# Deployment Infrastructure

This directory contains documentation and configuration for the SoloSuccess Intel Academy deployment infrastructure.

## Overview

The deployment setup includes:

1. **Docker Configuration** - Containerization for all services
2. **CI/CD Pipeline** - Automated testing and deployment
3. **Hosting Configuration** - Multi-platform deployment support
4. **Monitoring & Logging** - Error tracking and performance monitoring

## Directory Structure

```
.
├── .github/workflows/          # GitHub Actions workflows
│   ├── ci.yml                 # Linting and type checking
│   ├── test.yml               # Unit and integration tests
│   ├── e2e-tests.yml          # End-to-end tests
│   ├── deploy-staging.yml     # Staging deployment
│   ├── deploy-production.yml  # Production deployment
│   ├── backup.yml             # Database backups
│   └── health-check.yml       # Health monitoring
├── backend/
│   ├── Dockerfile             # Production backend image
│   ├── Dockerfile.dev         # Development backend image
│   └── src/
│       ├── config/
│       │   ├── sentry.ts      # Error tracking
│       │   ├── logger.ts      # Logging configuration
│       │   └── monitoring.ts  # Performance monitoring
│       └── scripts/
│           └── backup-database.ts  # Backup script
├── frontend/
│   ├── Dockerfile             # Production frontend image
│   ├── Dockerfile.dev         # Development frontend image
│   └── nginx.conf             # Nginx configuration
├── docker-compose.yml         # Production orchestration
├── docker-compose.dev.yml     # Development orchestration
├── vercel.json                # Vercel configuration
├── netlify.toml               # Netlify configuration
├── railway.json               # Railway configuration
├── render.yaml                # Render configuration
└── alerts.config.example.json # Alert configuration

```

## Quick Links

- [Deployment Guide](../DEPLOYMENT.md) - Step-by-step deployment instructions
- [Monitoring Guide](../MONITORING.md) - Monitoring and logging setup
- [Setup Summary](../DEPLOYMENT_SETUP_SUMMARY.md) - Implementation summary

## Getting Started

### Local Development

```bash
# Start all services with Docker
docker-compose up

# Or use development mode with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Deploy to Staging

```bash
# Push to develop branch
git push origin develop
```

### Deploy to Production

```bash
# Push to main branch (requires approval)
git push origin main
```

## Configuration

### Required Secrets

Add these to your GitHub repository settings:

- `VERCEL_TOKEN` or `NETLIFY_TOKEN`
- `RAILWAY_TOKEN` or `RENDER_API_KEY`
- `STAGING_DATABASE_URL`
- `PRODUCTION_DATABASE_URL`
- `STAGING_API_URL`
- `PRODUCTION_API_URL`

### Environment Variables

See `.env.example` for all required environment variables.

## Monitoring

### Health Checks

- Frontend: `https://solosuccess-academy.com/health`
- Backend: `https://api.solosuccess-academy.com/api/health`

### Error Tracking

Configure Sentry DSN in environment variables for automatic error tracking.

### Logs

- Development: Console output
- Production: Winston logs to files and console

## Backups

### Automated

- Daily backups via GitHub Actions at 2 AM UTC
- 30-day retention in GitHub artifacts

### Manual

```bash
npm run backup:db --workspace=backend
```

## Support

For issues or questions:

1. Check the [Deployment Guide](../DEPLOYMENT.md)
2. Review [Monitoring Guide](../MONITORING.md)
3. Check GitHub Actions logs
4. Review hosting platform logs

## Architecture

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────┐                   ┌─────────────┐
│   Staging   │                   │ Production  │
│ Environment │                   │ Environment │
└──────┬──────┘                   └──────┬──────┘
       │                                 │
       ├──────────┬──────────┐          ├──────────┬──────────┐
       ▼          ▼          ▼          ▼          ▼          ▼
   Frontend   Backend   Database    Frontend   Backend   Database
   (Vercel)   (Railway) (Railway)   (Vercel)   (Railway) (Railway)
```

## CI/CD Pipeline

```
Push to Branch
      │
      ▼
  Lint & Type Check
      │
      ▼
   Run Tests
      │
      ▼
  Build Application
      │
      ├─────────────┬─────────────┐
      │             │             │
      ▼             ▼             ▼
   Staging    Manual Approval  Production
   Deploy                       Deploy
      │                            │
      ▼                            ▼
  Smoke Tests                 Smoke Tests
```

## Security

- All secrets encrypted in GitHub Secrets
- Non-root Docker containers
- HTTPS enforced
- Security headers configured
- Rate limiting enabled
- Input sanitization
- Database backups encrypted

## Performance

- Response time target: < 500ms (p95)
- Error rate target: < 1%
- Uptime target: > 99.9%
- Memory usage target: < 80%

## Maintenance

### Regular Tasks

- Review error logs weekly
- Check performance metrics weekly
- Test backup restoration monthly
- Update dependencies monthly
- Review security alerts immediately

### Scaling

- Frontend: Auto-scales with hosting provider
- Backend: Configure auto-scaling in hosting platform
- Database: Upgrade plan as needed
- Redis: Upgrade plan as needed

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Check hosting platform status
4. Review build logs

### Application Down

1. Check health endpoints
2. Review error logs in Sentry
3. Check hosting platform status
4. Verify database connectivity

### Slow Performance

1. Check performance metrics
2. Review slow query logs
3. Check Redis cache hit rate
4. Monitor resource usage

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Sentry Documentation](https://docs.sentry.io/)

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0
