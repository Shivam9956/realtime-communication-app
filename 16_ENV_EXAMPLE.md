# Environment Variables

Never commit the real `.env` file.

## Server `.env`
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/realtime_communication

CLIENT_URL=http://localhost:5173

JWT_SECRET=replace-with-a-long-random-secret

STUN_SERVERS=stun:stun.l.google.com:19302

TURN_URL=
TURN_USERNAME=
TURN_CREDENTIAL=

MAX_FILE_SIZE_MB=10
```

## Client `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

For production, replace local URLs with HTTPS/WSS production URLs.
