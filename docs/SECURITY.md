# Security Implementation Guide

This document outlines the security measures implemented in the SoloSuccess Intel Academy backend.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Input Sanitization](#input-sanitization)
3. [HTTPS & Secure Cookies](#https--secure-cookies)
4. [Rate Limiting](#rate-limiting)
5. [Security Headers](#security-headers)
6. [File Upload Security](#file-upload-security)
7. [Production Deployment](#production-deployment)

## Authentication & Authorization

### JWT Implementation

- **Access Tokens**: 15-minute expiration for short-lived authentication
- **Refresh Tokens**: 7-day expiration stored in httpOnly cookies
- **Token Rotation**: New refresh token generated on each refresh request
- **Secure Storage**: Refresh tokens stored in httpOnly, secure cookies (not accessible via JavaScript)

### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Requirements**: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
- **Reset Tokens**: Expire after 1 hour
- **Rate Limiting**: 5 login attempts per 15 minutes per IP

### Authorization

- Role-based access control (RBAC)
- Middleware checks for protected routes
- Course enrollment verification for lesson access
- Sequential progression validation

## Input Sanitization

### XSS Protection

All user input is sanitized to prevent Cross-Site Scripting (XSS) attacks:

- **Automatic Sanitization**: `sanitizeRequest` middleware applied to all routes
- **HTML Stripping**: User-generated content (notes, forum posts, bio) has HTML tags stripped
- **XSS Library**: Uses `xss` library for comprehensive protection

### Implementation

```typescript
// Middleware automatically sanitizes:
// - req.body
// - req.query
// - req.params

// Manual sanitization for specific fields:
import { stripHtmlTags } from '../utils/sanitization.js';
const sanitizedContent = stripHtmlTags(userInput);
```

### SQL Injection Prevention

- **Prisma ORM**: Uses parameterized queries automatically
- **No Raw SQL**: All database queries go through Prisma's type-safe API

### File Upload Validation

- **MIME Type Checking**: Only allowed file types accepted
- **File Size Limits**: Maximum 5MB for images
- **Filename Sanitization**: Removes path traversal attempts and dangerous characters
- **Content Validation**: Base64 image validation before upload

## HTTPS & Secure Cookies

### Cookie Configuration

All cookies are configured with security flags:

```typescript
{
  httpOnly: true,        // Prevents JavaScript access
  secure: true,          // Only sent over HTTPS (production)
  sameSite: 'strict',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
  domain: process.env.COOKIE_DOMAIN // Set in production
}
```

### HTTPS Enforcement

- **Production Only**: Secure flag enabled when `NODE_ENV=production`
- **HSTS Headers**: HTTP Strict Transport Security with 1-year max-age
- **Preload Ready**: HSTS configured for browser preload lists

## Rate Limiting

### General API Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: All `/api/*` routes
- **Headers**: Standard rate limit headers included

### Authentication Rate Limiting

- **Limit**: 5 attempts per 15 minutes per IP
- **Scope**: Login, register, password reset endpoints
- **Skip Successful**: Successful requests don't count toward limit

### Configuration

```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window
```

## Security Headers

Implemented via Helmet.js:

### HTTP Strict Transport Security (HSTS)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Content Security Policy (CSP)

```
Content-Security-Policy: 
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self';
  img-src 'self' data: https:;
  connect-src 'self';
  font-src 'self';
  object-src 'none';
  media-src 'self';
  frame-src 'none';
```

### X-Frame-Options

```
X-Frame-Options: DENY
```

Prevents clickjacking attacks by denying iframe embedding.

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

Prevents MIME type sniffing.

### X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

Enables browser XSS filtering.

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

Controls referrer information sent with requests.

## File Upload Security

### Image Upload Validation

1. **Format Validation**: Only JPEG, PNG, GIF, WebP allowed
2. **Size Validation**: Maximum 5MB
3. **Content Validation**: Base64 data URL format checked
4. **Sanitization**: Filenames sanitized to prevent path traversal

### Cloudinary Configuration

```typescript
{
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  transformation: [
    { width: 400, height: 400, crop: 'fill' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
}
```

## Production Deployment

### Environment Variables

Required for production:

```env
NODE_ENV=production
COOKIE_DOMAIN=.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
```

### SSL/TLS Certificate

1. Obtain SSL certificate (Let's Encrypt, Cloudflare, etc.)
2. Configure reverse proxy (Nginx, Caddy) for HTTPS
3. Redirect HTTP to HTTPS
4. Enable HSTS headers

### Example Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random JWT secrets
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Set `COOKIE_DOMAIN` to your domain
- [ ] Configure CORS with production origin
- [ ] Enable HSTS headers
- [ ] Test rate limiting
- [ ] Verify secure cookies are working
- [ ] Test input sanitization
- [ ] Review and update CSP directives
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Test password reset flow
- [ ] Verify file upload restrictions

### Monitoring & Logging

- Use structured logging (Winston/Pino)
- Monitor failed authentication attempts
- Track rate limit violations
- Log security-related errors
- Set up alerts for suspicious activity

### Regular Security Maintenance

- Keep dependencies updated
- Review security advisories
- Rotate JWT secrets periodically
- Audit user permissions
- Review and update CSP policies
- Test security measures regularly
- Conduct penetration testing

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

## Reporting Security Issues

If you discover a security vulnerability, please email security@solosuccess.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Do not publicly disclose security issues until they have been addressed.
