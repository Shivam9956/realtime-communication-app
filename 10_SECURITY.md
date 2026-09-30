# Security Requirements

## Authentication
- Hash passwords with bcrypt/Argon2.
- Never store plaintext passwords.
- Use secure authentication cookies or carefully implemented short-lived tokens.
- Implement logout/invalidation correctly.

## Authorization
Every protected resource must verify:
1. User is authenticated.
2. User is authorized for the resource.
3. User belongs to the meeting when meeting-scoped data is requested.

## Transport
Production must use HTTPS/WSS.

## WebRTC
WebRTC media uses encrypted transport. Configure STUN/TURN securely.

## Backend
Implement:
- Helmet/security headers
- CORS allowlist
- Rate limiting
- Request size limits
- Input validation
- Secure error responses
- Logging without secrets

## Files
Reject dangerous file types and unsafe filenames.
Never allow path traversal.

## Secrets
Use environment variables:
```text
MONGODB_URI=
JWT_SECRET=
TURN_URL=
TURN_USERNAME=
TURN_CREDENTIAL=
STORAGE_SECRET=
```

Never commit `.env`.

## Frontend
- Do not place secrets in React source.
- Do not trust client-side authorization.
- Do not render unsanitized HTML.

## Data minimization
Only store information required for the application.

## Security testing
Test:
- Unauthorized API access
- Meeting access by non-members
- Invalid JWT/session
- Rate limits
- File upload abuse
- XSS payloads
- Path traversal
- CORS behavior
