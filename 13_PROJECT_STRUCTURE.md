# Recommended Project Structure

```text
realtime-communication-app/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── docs/
├── README.md
├── .gitignore
└── package.json
```

## Important separation
Do not put all logic into App.jsx or server.js.

Keep:
- API calls in services
- WebRTC logic in hooks/services
- Socket listeners in a dedicated layer
- Authentication in context/service
- Database operations in models/services
- Validation in middleware/schemas
