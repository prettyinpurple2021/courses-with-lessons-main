# Monitoring and Logging Guide

This guide covers monitoring, logging, and alerting setup for the SoloSuccess Intel Academy platform.

## Table of Contents

- [Error Tracking](#error-tracking)
- [Application Monitoring](#application-monitoring)
- [Logging](#logging)
- [Uptime Monitoring](#uptime-monitoring)
- [Database Backups](#database-backups)
- [Alerts](#alerts)

## Error Tracking

### Sentry Setup

Sentry is configured for error tracking and performance monitoring.

#### Installation

```bash
npm install @sentry/node @sentry/profiling-node --workspace=backend
```

#### Configuration

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for Node.js
3. Copy the DSN from project settings
4. Add to environment variables:

```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

#### Features

- **Error Tracking**: Automatic capture of unhandled errors
- **Performance Monitoring**: Track slow requests and database queries
- **Profiling**: CPU and memory profiling
- **Release Tracking**: Track errors by deployment version
- **Source Maps**: View original source code in stack traces

#### Usage

The Sentry integration is automatically initialized in the backend. Errors are captured automatically, but you can also manually capture:

```typescript
import * as Sentry from '@sentry/node';

// Capture an exception
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
}

// Capture a message
Sentry.captureMessage('Something went wrong', 'warning');

// Add context
Sentry.setUser({ id: userId, email: userEmail });
Sentry.setTag('feature', 'course-enrollment');
```

#### Sensitive Data

The Sentry configuration automatically filters:
- Authorization headers
- Cookies
- Password fields
- Token parameters

## Application Monitoring

### Performance Metrics

The application tracks the following metrics:

- **Request Count**: Total number of requests
- **Error Count**: Number of failed requests (4xx, 5xx)
- **Average Response Time**: Mean response time across all requests
- **Slow Requests**: Requests taking longer than 1 second
- **Memory Usage**: Heap and RSS memory usage

### Health Check Endpoint

```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "metrics": {
    "requestCount": 1000,
    "errorCount": 5,
    "averageResponseTime": 150,
    "slowRequests": 2
  },
  "memory": {
    "rss": "150 MB",
    "heapUsed": "80 MB",
    "heapTotal": "120 MB"
  },
  "database": "connected",
  "redis": "connected"
}
```

### Metrics Endpoint

```bash
GET /api/metrics
```

Returns current performance metrics for monitoring dashboards.

## Logging

### Winston Logger

The application uses Winston for structured logging.

#### Log Levels

- `error`: Error events that might still allow the application to continue
- `warn`: Warning messages for potentially harmful situations
- `info`: Informational messages highlighting progress
- `debug`: Detailed information for debugging

#### Log Format

**Development:**
```
2024-01-01 12:00:00 [info]: HTTP Request { method: 'GET', url: '/api/courses', status: 200, duration: '50ms' }
```

**Production (JSON):**
```json
{
  "timestamp": "2024-01-01 12:00:00",
  "level": "info",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/courses",
  "status": 200,
  "duration": "50ms",
  "service": "solosuccess-backend",
  "environment": "production"
}
```

#### Usage

```typescript
import logger from './config/logger';

// Log messages
logger.info('User enrolled in course', { userId, courseId });
logger.warn('High memory usage detected', { heapUsedPercent: 95 });
logger.error('Database connection failed', { error: error.message });

// Create child logger with context
const userLogger = logger.child({ userId, email });
userLogger.info('User action performed');
```

#### Log Files

In production, logs are written to:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs

Files are rotated when they reach 5MB, keeping the last 5 files.

### Centralized Logging

For production, consider using a centralized logging service:

**Option 1: AWS CloudWatch**
```bash
npm install winston-cloudwatch
```

**Option 2: LogDNA**
```bash
npm install @logdna/logger
```

**Option 3: Datadog**
```bash
npm install winston-datadog
```

## Uptime Monitoring

### Recommended Services

#### UptimeRobot (Free)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitors for:
   - Frontend: `https://solosuccess-academy.com/health`
   - Backend: `https://api.solosuccess-academy.com/api/health`
3. Configure alerts (email, SMS, Slack)
4. Set check interval to 5 minutes

#### Better Uptime

1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Create monitors for both frontend and backend
3. Set up incident management
4. Configure status page

#### Pingdom

1. Sign up at [pingdom.com](https://pingdom.com)
2. Create uptime checks
3. Set up real user monitoring (RUM)
4. Configure alerts

### Health Check Monitoring

Monitor these endpoints:

```bash
# Backend health
curl https://api.solosuccess-academy.com/api/health

# Frontend health
curl https://solosuccess-academy.com/health

# Database connectivity (via backend)
curl https://api.solosuccess-academy.com/api/health | jq '.database'

# Redis connectivity (via backend)
curl https://api.solosuccess-academy.com/api/health | jq '.redis'
```

## Database Backups

### Automated Backups

#### Railway
- Automatic daily backups
- 7-day retention
- Point-in-time recovery available

#### Render
- Automatic daily backups
- 7-day retention (free tier)
- 30-day retention (paid tiers)

#### Supabase
- Automatic daily backups
- 7-day retention (free tier)
- Custom retention (paid tiers)

### Manual Backups

#### Using the Backup Script

```bash
# Run backup
npm run backup:db --workspace=backend

# With custom settings
BACKUP_DIR=./my-backups BACKUP_RETENTION_DAYS=60 npm run backup:db --workspace=backend
```

#### Using pg_dump

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup.sql.gz

# Restore database
psql $DATABASE_URL < backup.sql

# Restore compressed backup
gunzip -c backup.sql.gz | psql $DATABASE_URL
```

### Backup Schedule

Recommended backup schedule:
- **Daily**: Automated backups via hosting provider
- **Weekly**: Manual backup to external storage
- **Before deployments**: Manual backup before major changes

### Backup Storage

Store backups in multiple locations:
1. Hosting provider (automatic)
2. AWS S3 or similar cloud storage
3. Local encrypted storage (for critical data)

## Alerts

### Alert Configuration

#### Sentry Alerts

Configure in Sentry dashboard:
- Error rate threshold: > 10 errors/minute
- New issue alerts: Immediate notification
- Regression alerts: When resolved issues reoccur

#### Uptime Alerts

Configure in uptime monitoring service:
- Downtime: Immediate notification
- Slow response: > 3 seconds
- SSL certificate expiration: 7 days before

#### Performance Alerts

Monitor and alert on:
- Response time > 1 second (95th percentile)
- Error rate > 5%
- Memory usage > 90%
- Database connection failures

### Notification Channels

#### Email
- Configure in each monitoring service
- Use team email or distribution list

#### Slack
```bash
# Sentry Slack integration
# Configure in Sentry → Settings → Integrations → Slack

# UptimeRobot Slack webhook
# Configure in UptimeRobot → My Settings → Alert Contacts
```

#### Discord
```bash
# Create webhook in Discord server
# Add webhook URL to monitoring services
```

#### PagerDuty
- For critical production alerts
- Configure escalation policies
- Set up on-call schedules

### Alert Severity Levels

**Critical (P1):**
- Application down
- Database connection lost
- Authentication system failure

**High (P2):**
- High error rate (> 10%)
- Slow response times (> 3s)
- Memory leaks detected

**Medium (P3):**
- Elevated error rate (> 5%)
- Slow queries detected
- High memory usage (> 80%)

**Low (P4):**
- Individual errors
- Performance degradation
- Non-critical warnings

## Monitoring Dashboard

### Recommended Tools

#### Grafana
- Open-source monitoring dashboard
- Visualize metrics from multiple sources
- Create custom dashboards

#### Datadog
- Full-stack monitoring
- APM (Application Performance Monitoring)
- Log management

#### New Relic
- Application monitoring
- Infrastructure monitoring
- Real user monitoring

### Key Metrics to Monitor

**Application:**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Active users

**Infrastructure:**
- CPU usage
- Memory usage
- Disk usage
- Network I/O

**Database:**
- Query performance
- Connection pool usage
- Slow queries
- Database size

**Redis:**
- Memory usage
- Hit rate
- Evicted keys
- Connected clients

## Best Practices

1. **Set up monitoring before launch**: Don't wait for issues to occur
2. **Test alerts**: Verify notifications are working
3. **Document runbooks**: Create procedures for common issues
4. **Review metrics regularly**: Weekly review of performance trends
5. **Tune alert thresholds**: Avoid alert fatigue
6. **Monitor user experience**: Track real user metrics
7. **Keep backups tested**: Regularly test backup restoration
8. **Rotate logs**: Prevent disk space issues
9. **Secure monitoring data**: Protect sensitive information
10. **Update dependencies**: Keep monitoring tools up to date

## Troubleshooting

### High Error Rate

1. Check Sentry for error details
2. Review application logs
3. Check database connectivity
4. Verify Redis connectivity
5. Check for deployment issues

### Slow Response Times

1. Check database query performance
2. Review slow request logs
3. Check Redis cache hit rate
4. Monitor CPU and memory usage
5. Review recent code changes

### Memory Leaks

1. Monitor memory usage over time
2. Check for unclosed connections
3. Review event listener cleanup
4. Use heap snapshots for analysis
5. Check for circular references

### Database Issues

1. Check connection pool settings
2. Review slow query logs
3. Check for missing indexes
4. Monitor database size
5. Verify backup integrity

## Support

For monitoring and logging issues:
1. Check service status pages
2. Review documentation
3. Contact support for monitoring services
4. Check GitHub issues for known problems
