# Deployment Guide

## Production components

### Frontend
Deploy React app to a frontend host such as Vercel.

### Backend
Deploy Node.js/Express to a backend host such as Render/Railway/Fly.io or another suitable production platform.

### Database
MongoDB Atlas or managed MongoDB.

### Storage
Use an object storage provider for production file uploads.

## Required production environment variables

Frontend:
```text
VITE_API_URL=
VITE_SOCKET_URL=
```

Backend:
```text
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
STUN_SERVERS=
TURN_URL=
TURN_USERNAME=
TURN_CREDENTIAL=
```

## Production checklist
- HTTPS enabled
- WSS enabled
- CORS restricted
- Database access restricted
- Secrets configured
- Logs enabled
- File storage configured
- File limits configured
- Rate limits enabled
- Error monitoring configured
- Health endpoint available

## Health endpoint
Create:
`GET /api/health`

Return a small JSON response indicating service health.

## Deployment order
1. Database
2. Backend
3. Storage
4. Frontend
5. Environment variables
6. CORS configuration
7. WebRTC/STUN/TURN configuration
8. End-to-end testing
