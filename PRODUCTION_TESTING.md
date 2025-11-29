# Production Testing Guide

Comprehensive testing procedures for production deployment of SoloSuccess Intel Academy.

## Pre-Deployment Testing

### 1. Local Docker Testing

```bash
# Build images locally
docker build -t solosuccess-backend:test -f backend/Dockerfile backend/
docker build -t solosuccess-frontend:test -f frontend/Dockerfile frontend/

# Test with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Run health checks
bash scripts/health-check.sh

# Clean up
docker-compose -f docker-compose.prod.yml down
```

### 2. Environment Variable Validation

```bash
# Validate backend environment
cd backend
npm run validate:env
```

### 3. Security Audit

```bash
# Run security audit
bash scripts/security-audit.sh
```

### 4. Build Verification

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Check build outputs
ls -lh backend/dist
ls -lh frontend/dist
```

## Smoke Tests

### Backend Smoke Tests

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Expected: JSON with status "healthy"

# Database connectivity
curl https://api.yourdomain.com/api/health | jq '.database'
# Expected: "connected"

# Redis connectivity
curl https://api.yourdomain.com/api/health | jq '.redis'
# Expected: "connected"
```

### Frontend Smoke Tests

```bash
# Health check
curl https://yourdomain.com/health
# Expected: "healthy"

# Homepage loads
curl -I https://yourdomain.com
# Expected: HTTP 200

# API connectivity
curl https://yourdomain.com | grep -q "api"
# Verify API calls work
```

### Automated Smoke Tests

```bash
# Run health check script
BACKEND_URL=https://api.yourdomain.com \
FRONTEND_URL=https://yourdomain.com \
bash scripts/health-check.sh
```

## Functional Testing

### Authentication Flow

1. **Registration**
   - [ ] User can register with valid email
   - [ ] Password requirements enforced
   - [ ] Email verification works (if implemented)
   - [ ] Duplicate email rejected

2. **Login**
   - [ ] User can login with correct credentials
   - [ ] Invalid credentials rejected
   - [ ] Rate limiting works (5 attempts)
   - [ ] JWT tokens issued correctly

3. **Session Management**
   - [ ] Refresh token works
   - [ ] Session persists across page reloads
   - [ ] Logout clears session

### Course Progression

1. **Course Access**
   - [ ] Course 1 accessible after registration
   - [ ] Subsequent courses locked until prerequisites met
   - [ ] Course unlocks after exam pass

2. **Lesson Progression**
   - [ ] Lessons unlock sequentially
   - [ ] Cannot skip ahead
   - [ ] Progress tracked correctly

3. **Activity Completion**
   - [ ] Activities unlock sequentially
   - [ ] Submissions saved
   - [ ] Completion tracked

### API Endpoints

Test critical endpoints:

```bash
# Courses
curl https://api.yourdomain.com/api/courses

# Lessons
curl https://api.yourdomain.com/api/courses/1/lessons

# User profile
curl -H "Authorization: Bearer $TOKEN" \
  https://api.yourdomain.com/api/users/me

# Progress
curl -H "Authorization: Bearer $TOKEN" \
  https://api.yourdomain.com/api/progress
```

## Performance Testing

### Response Time Benchmarks

**Backend API:**
- Health check: < 100ms
- Course list: < 500ms
- Lesson details: < 500ms
- User profile: < 300ms
- Progress update: < 1s

**Frontend:**
- Initial load: < 2s
- Page navigation: < 500ms
- API calls: < 1s

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://api.yourdomain.com/api/health

# Using curl (simple)
for i in {1..100}; do
  curl -s -o /dev/null -w "%{time_total}\n" \
    https://api.yourdomain.com/api/health
done | awk '{sum+=$1; count++} END {print sum/count}'
```

### Database Performance

```bash
# Check slow queries
# In PostgreSQL:
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Security Testing

### 1. Authentication Security

- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens secure
- [ ] Refresh tokens rotate
- [ ] Session timeout works
- [ ] CSRF protection enabled

### 2. Authorization

- [ ] Protected routes require auth
- [ ] Admin routes require admin role
- [ ] Users can't access others' data
- [ ] Course access validated

### 3. Input Validation

- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] File upload validation
- [ ] Email validation
- [ ] URL validation

### 4. Rate Limiting

```bash
# Test rate limiting
for i in {1..110}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    https://api.yourdomain.com/api/courses
done

# Should see 429 after 100 requests
```

### 5. Security Headers

```bash
# Check security headers
curl -I https://api.yourdomain.com/api/health

# Verify:
# - X-Frame-Options
# - X-Content-Type-Options
# - X-XSS-Protection
# - Strict-Transport-Security
# - Content-Security-Policy
```

## Integration Testing

### Database Integration

```bash
# Test database connection
cd backend
npm run test:redis

# Run migrations
npm run prisma:migrate deploy

# Verify schema
npx prisma studio
```

### Redis Integration

```bash
# Test Redis connection
cd backend
npm run test:redis

# Verify caching
# Check Redis logs for cache hits/misses
```

### External Services

1. **Cloudinary**
   - [ ] Image upload works
   - [ ] Image retrieval works
   - [ ] Transformations work

2. **Resend (Email)**
   - [ ] Password reset email sent
   - [ ] Welcome email sent
   - [ ] Email templates render correctly

3. **YouTube API**
   - [ ] Video validation works
   - [ ] Video metadata retrieved
   - [ ] Invalid videos rejected

## Monitoring Tests

### Health Check Monitoring

```bash
# Verify health check endpoint
curl https://api.yourdomain.com/api/health | jq '.'

# Should return:
# {
#   "status": "healthy",
#   "database": "connected",
#   "redis": "connected",
#   ...
# }
```

### Error Tracking

1. **Trigger Test Error**
   - Access invalid route
   - Submit invalid data
   - Check Sentry for error

2. **Verify Logging**
   - Check application logs
   - Verify error details logged
   - Check sensitive data filtered

### Performance Monitoring

1. **Check Metrics**
   - Response times
   - Error rates
   - Memory usage
   - CPU usage

2. **Verify Alerts**
   - Test alert configuration
   - Verify notifications work

## Browser Testing

### Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers

- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet

### Responsive Design

- [ ] Mobile (375x667)
- [ ] Tablet (768x1024)
- [ ] Desktop (1920x1080)

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Skip links work
- [ ] No keyboard traps

### Screen Reader

- [ ] Page structure announced
- [ ] Headings hierarchy correct
- [ ] Links descriptive
- [ ] Form labels present

### Color Contrast

- [ ] Text meets WCAG AA (4.5:1)
- [ ] Large text meets WCAG AA (3:1)
- [ ] Interactive elements distinguishable

## Post-Deployment Verification

### Immediate Checks (0-15 minutes)

1. [ ] All services healthy
2. [ ] Health checks passing
3. [ ] No critical errors in logs
4. [ ] Database migrations applied
5. [ ] Redis connected
6. [ ] Frontend loads correctly
7. [ ] API responds correctly

### Extended Checks (15-60 minutes)

1. [ ] User registration works
2. [ ] Login works
3. [ ] Course access works
4. [ ] Video playback works
5. [ ] Activity submission works
6. [ ] Email delivery works
7. [ ] File uploads work

### Ongoing Monitoring (24 hours)

1. [ ] Error rates normal
2. [ ] Response times acceptable
3. [ ] No memory leaks
4. [ ] Database performance good
5. [ ] Cache hit rates acceptable
6. [ ] User feedback positive

## Test Checklist

### Pre-Deployment

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security audit passes
- [ ] Performance benchmarks met
- [ ] Docker builds successful
- [ ] Environment variables validated

### Deployment

- [ ] Services deploy successfully
- [ ] Health checks pass
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] SSL certificates active
- [ ] Custom domains configured

### Post-Deployment

- [ ] Smoke tests pass
- [ ] Functional tests pass
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring active
- [ ] Alerts configured

## Troubleshooting Test Failures

### Health Check Failures

1. Check service logs
2. Verify environment variables
3. Check database/Redis connectivity
4. Verify health check endpoint

### Performance Issues

1. Check database queries
2. Verify caching is working
3. Check resource limits
4. Review slow query logs

### Security Issues

1. Review security headers
2. Check authentication flow
3. Verify input validation
4. Review error messages

## Test Automation

### CI/CD Integration

Tests run automatically in GitHub Actions:
- Unit tests
- Integration tests
- Security audits
- Docker builds
- Health checks

### Manual Testing

For manual testing, use provided scripts:
- `scripts/health-check.sh` - Health verification
- `scripts/security-audit.sh` - Security checks
- `scripts/deploy-render.sh` - Pre-deployment checks

## Reporting

### Test Results

Document test results:
- Date and time
- Environment tested
- Tests performed
- Results (pass/fail)
- Issues found
- Resolution steps

### Issue Tracking

Track issues found:
- Severity (Critical/High/Medium/Low)
- Steps to reproduce
- Expected vs actual behavior
- Resolution status

## Continuous Improvement

1. **Regular Testing**
   - Weekly smoke tests
   - Monthly full test suite
   - Quarterly security audit

2. **Performance Monitoring**
   - Track metrics over time
   - Identify trends
   - Optimize bottlenecks

3. **Test Coverage**
   - Maintain test coverage > 80%
   - Add tests for new features
   - Update tests for changes

## Additional Resources

- [Testing Checklist](./TESTING_CHECKLIST.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Production Deployment](./RENDER_DEPLOYMENT.md)
- [Docker Production](./DOCKER_PRODUCTION.md)

