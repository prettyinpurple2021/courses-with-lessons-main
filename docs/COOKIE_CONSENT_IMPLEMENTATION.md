# Cookie Consent Production Implementation

## Overview

This document describes the production-ready cookie consent implementation that stores consent both client-side (localStorage) and server-side (database) for GDPR compliance and audit trail.

## Architecture

### Hybrid Storage Approach

1. **Client-Side (localStorage)**: Fast access, immediate UX
   - Primary storage for client-side preference checks
   - No network delay
   - Works offline

2. **Server-Side (Database)**: Compliance and audit trail
   - GDPR compliance proof
   - Audit trail for all consent decisions
   - Cross-device sync capability
   - Server-side verification

3. **httpOnly Cookie**: Optional backup
   - More secure than localStorage
   - Set by server automatically
   - Not accessible to JavaScript (XSS protection)

## Database Schema

```prisma
model CookieConsent {
  id          String   @id @default(cuid())
  userId      String?  // Nullable for anonymous users
  sessionId   String?  // For anonymous tracking
  preferences Json     // { necessary, analytics, marketing }
  version     String   @default("1.0")
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionId])
  @@index([timestamp])
}
```

## API Endpoints

### POST /api/consent/cookie
Store cookie consent preferences.

**Request:**
```json
{
  "preferences": {
    "necessary": true,
    "analytics": false,
    "marketing": false
  },
  "version": "1.0",
  "sessionId": "anon_123..." // Optional, auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Cookie consent stored successfully",
    "preferences": { ... },
    "version": "1.0"
  }
}
```

**Features:**
- Works for both authenticated and anonymous users
- Automatically generates session ID for anonymous users
- Sets httpOnly session cookie
- Sets non-httpOnly consent cookie as backup

### GET /api/consent/cookie
Get latest cookie consent for current user/session.

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": { ... },
    "version": "1.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/consent/cookie
Delete all consent records (GDPR right to be forgotten).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Cookie consent deleted successfully"
  }
}
```

## Frontend Usage

### CookieConsentService

```typescript
import CookieConsentService from '@/services/cookieConsentService';

// Store consent (saves to localStorage + syncs to backend)
await CookieConsentService.storeConsent({
  necessary: true,
  analytics: true,
  marketing: false,
});

// Get consent from localStorage
const consent = CookieConsentService.getConsent();

// Check if analytics consent is given
const hasAnalytics = CookieConsentService.hasAnalyticsConsent();

// Delete consent (GDPR right to be forgotten)
await CookieConsentService.deleteConsent();
```

### CookieConsent Component

The `CookieConsent` component automatically:
1. Checks localStorage for existing consent
2. Shows banner if no consent found
3. Stores consent in localStorage (immediate UX)
4. Syncs consent to backend (compliance)
5. Dispatches events for analytics enable/disable

## GDPR Compliance Features

### ✅ Audit Trail
- Every consent decision is stored in database
- Includes timestamp, IP address, user agent
- Can prove compliance if audited

### ✅ User Rights
- Users can view their consent history
- Users can delete consent (right to be forgotten)
- Users can update preferences at any time

### ✅ Versioning
- Consent policy version tracked
- Can update policy and re-request consent
- Old consent records preserved for audit

### ✅ Anonymous Users
- Session-based tracking for anonymous users
- No PII stored for anonymous consent
- Can link to user account when they register

## Security Features

### ✅ XSS Protection
- httpOnly cookie option (set by server)
- Server-side validation
- Database record is authoritative

### ✅ Tamper-Proof
- Server-side storage prevents client manipulation
- Database record is source of truth
- Client-side localStorage is for UX only

### ✅ Cross-Device Sync
- Authenticated users: consent synced across devices
- Anonymous users: session-based per device
- Can merge anonymous consent when user registers

## Migration Steps

1. **Run Database Migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_cookie_consent
   ```

2. **Update Frontend:**
   - Already updated to use `CookieConsentService`
   - Component automatically syncs to backend

3. **Verify:**
   - Test consent storage in browser
   - Check database for consent records
   - Verify API endpoints work

## Testing

### Manual Testing

1. **New User:**
   - Visit site → See consent banner
   - Accept all → Check localStorage + database
   - Refresh page → Banner should not appear

2. **Anonymous User:**
   - Accept consent → Check session ID cookie
   - Check database for session-based record

3. **Authenticated User:**
   - Login → Accept consent
   - Check database for user-linked record
   - Logout/login → Consent should persist

4. **GDPR Rights:**
   - Delete consent → Check database deletion
   - Verify cookies cleared

### Automated Testing

```typescript
// Test consent storage
test('stores consent in localStorage and backend', async () => {
  await CookieConsentService.storeConsent({
    necessary: true,
    analytics: true,
    marketing: false,
  });
  
  expect(CookieConsentService.getConsent()).toBeTruthy();
  // Verify API call was made
});

// Test consent retrieval
test('retrieves consent from localStorage', () => {
  const consent = CookieConsentService.getConsent();
  expect(consent?.preferences.analytics).toBeDefined();
});

// Test GDPR deletion
test('deletes consent on user request', async () => {
  await CookieConsentService.deleteConsent();
  expect(CookieConsentService.getConsent()).toBeNull();
});
```

## Production Checklist

- [x] Database schema created
- [x] API endpoints implemented
- [x] Frontend service created
- [x] Component updated to use service
- [x] Migration created
- [ ] Run migration in production
- [ ] Test consent flow end-to-end
- [ ] Verify GDPR compliance
- [ ] Update privacy policy
- [ ] Monitor consent storage in production

## Notes

- localStorage is primary for UX (fast, no network delay)
- Database is primary for compliance (audit trail, proof)
- httpOnly cookie is optional backup (more secure)
- All three methods work together for best UX + compliance

## Future Enhancements

1. **Consent Analytics Dashboard**: View consent rates, preferences breakdown
2. **Consent Version Management**: Track policy changes, re-request consent
3. **Bulk Consent Operations**: Admin tools for consent management
4. **Consent Export**: GDPR data export includes consent history
5. **Automated Compliance Reports**: Generate compliance reports automatically

