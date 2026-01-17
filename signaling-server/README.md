# 🎥 HealthConnect WebRTC Signaling Server

WebRTC signaling server for HealthConnect video calling feature.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 Server Info

- **Port:** 4000
- **Health Check:** http://localhost:4000/health
- **Transport:** WebSocket (Socket.io)

## 🔌 API Endpoints

### Health Check
```
GET /health

Response:
{
  "status": "OK",
  "activeRooms": 0,
  "activeUsers": 0,
  "timestamp": "2025-10-18T10:30:00.000Z"
}
```

### Create Room
```
POST /api/rooms/create

Body:
{
  "appointmentId": "APPT-123",
  "doctorId": "doc123",
  "patientId": "pat456"
}

Response:
{
  "success": true,
  "roomId": "APPT-123",
  "message": "Room created successfully"
}
```

### Get Room Info
```
GET /api/rooms/:roomId

Response:
{
  "success": true,
  "room": {
    "id": "ROOM-123",
    "participants": [],
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

## 📨 Socket.io Events

### Client → Server

| Event | Description | Data |
|-------|-------------|------|
| `join-room` | Join a video call room | `{ roomId, userId, userType, userName }` |
| `offer` | Send WebRTC offer | `{ offer, to }` |
| `answer` | Send WebRTC answer | `{ answer, to }` |
| `ice-candidate` | Send ICE candidate | `{ candidate, to }` |
| `start-call` | Start the call | `{ roomId }` |
| `end-call` | End the call | `{ roomId }` |
| `toggle-video` | Toggle video on/off | `{ roomId, enabled }` |
| `toggle-audio` | Toggle audio on/off | `{ roomId, enabled }` |
| `leave-room` | Leave the room | `{ roomId }` |

### Server → Client

| Event | Description | Data |
|-------|-------------|------|
| `room-joined` | Successfully joined room | `{ roomId, participants }` |
| `user-joined` | Another user joined | `{ socketId, userId, userType, userName }` |
| `user-left` | User left the room | `{ socketId, user }` |
| `offer` | Received WebRTC offer | `{ offer, from, fromUser }` |
| `answer` | Received WebRTC answer | `{ answer, from, fromUser }` |
| `ice-candidate` | Received ICE candidate | `{ candidate, from }` |
| `call-started` | Call was started | `{ from, fromUser }` |
| `call-ended` | Call was ended | `{ from, fromUser }` |
| `peer-toggle-video` | Peer toggled video | `{ from, enabled }` |
| `peer-toggle-audio` | Peer toggled audio | `{ from, enabled }` |

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Client 1 (Doctor)           │
└──────────────┬──────────────────────┘
               │ Socket.io
               ↓
┌─────────────────────────────────────┐
│      Signaling Server (Port 4000)   │
│  ┌───────────────────────────────┐  │
│  │  Room Management              │  │
│  │  - Active Rooms Map           │  │
│  │  - User Tracking              │  │
│  │  - Participant Lists          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  WebRTC Signaling             │  │
│  │  - Offer/Answer Exchange      │  │
│  │  - ICE Candidate Relay        │  │
│  │  - Connection Management      │  │
│  └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ Socket.io
               ↓
┌─────────────────────────────────────┐
│         Client 2 (Patient)          │
└─────────────────────────────────────┘
```

## 📊 Features

- ✅ Room creation and management
- ✅ User presence tracking
- ✅ WebRTC offer/answer signaling
- ✅ ICE candidate exchange
- ✅ Call state management
- ✅ User join/leave notifications
- ✅ Video/audio toggle signaling
- ✅ Automatic room cleanup
- ✅ CORS support
- ✅ Health monitoring

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
NODE_ENV=development
```

### CORS Origins

Allowed origins are configured in `server.js`:

```javascript
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:4000/health
```

### Create Room
```bash
curl -X POST http://localhost:4000/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"doctorId":"doc123","patientId":"pat456"}'
```

## 📝 Logs

The server provides detailed console logs:

```
✅ User connected: abc123
👤 Dr. Smith (doctor) joining room: ROOM-456
📊 Room ROOM-456 now has 2 participant(s)
📤 Sending offer from abc123 to def456
🧊 Sending ICE candidate from abc123 to def456
📞 Call started in room ROOM-456 by Dr. Smith
```

## 🚀 Deployment

### Production Deployment

1. **Deploy to Cloud:**
   ```bash
   # Heroku
   heroku create healthconnect-signaling
   git push heroku main
   
   # or AWS, Azure, Google Cloud, etc.
   ```

2. **Update Environment:**
   ```bash
   heroku config:set PORT=4000
   heroku config:set CORS_ORIGIN=https://yourdomain.com
   ```

3. **Update Client:**
   ```javascript
   // In webrtc.service.js
   const SIGNALING_SERVER_URL = 'https://your-signaling-server.com';
   ```

## 🔒 Security

### Production Recommendations:

- ✅ Use HTTPS (wss:// for Socket.io)
- ✅ Implement authentication/authorization
- ✅ Rate limiting for connections
- ✅ Validate all incoming data
- ✅ Implement room access controls
- ✅ Monitor for abuse
- ✅ Use environment variables
- ✅ Enable logging and monitoring

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Kill process using port
taskkill /PID <process_id> /F

# Restart server
npm start
```

### Socket.io Connection Issues

- Verify CORS settings
- Check firewall rules
- Ensure WebSocket support
- Try different transport method

### Room Not Found

- Check room ID spelling
- Verify room was created
- Check server logs
- Ensure server is running

## 📚 Dependencies

```json
{
  "socket.io": "^4.7.2",    // WebSocket communication
  "express": "^4.18.2",     // HTTP server
  "cors": "^2.8.5",         // Cross-origin support
  "uuid": "^9.0.1"          // Unique ID generation
}
```

## 📖 Documentation

For complete documentation, see:
- `../VIDEO_CALL_DOCUMENTATION.md` - Full implementation guide
- `../VIDEO_CALL_SUMMARY.md` - Quick reference

## 🤝 Support

For issues or questions:
- Check the main documentation
- Review server logs
- Test with `curl` commands
- Verify network connectivity

## 📄 License

MIT

---

**Made with ❤️ for HealthConnect**
