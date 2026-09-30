# REST API Specification

Base URL:
`/api`

## Auth

### POST /auth/register
Request:
```json
{
  "name": "User",
  "email": "user@example.com",
  "password": "strong-password"
}
```

### POST /auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "strong-password"
}
```

### POST /auth/logout

### GET /auth/me

## Meetings

### POST /meetings
Create a meeting.

### GET /meetings/:meetingId
Get meeting information subject to authorization.

### POST /meetings/:meetingId/join
Validate and register a participant if needed.

### POST /meetings/:meetingId/leave

### GET /meetings/history
Return meetings available to the authenticated user.

## Files

### POST /files
Authenticated multipart upload.

### GET /files/:fileId
Return an authorized file or signed access URL.

### DELETE /files/:fileId
Delete an authorized file.

## API rules
- Use correct HTTP status codes.
- Validate request bodies.
- Sanitize user input.
- Return consistent JSON error shapes.
- Never leak stack traces in production.
- Require authentication for protected endpoints.
- Check resource ownership/meeting membership.
