/**
 * HealthConnect - WebRTC Signaling Server
 * Handles real-time communication for doctor-patient video calls
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Socket.io setup with CORS
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    activeRooms: rooms.size,
    activeUsers: users.size,
    timestamp: new Date().toISOString()
  });
});

// Create room endpoint
app.post('/api/rooms/create', (req, res) => {
  const { appointmentId, doctorId, patientId } = req.body;
  const roomId = appointmentId || uuidv4();
  
  rooms.set(roomId, {
    id: roomId,
    doctorId,
    patientId,
    participants: [],
    createdAt: new Date().toISOString()
  });
  
  res.json({
    success: true,
    roomId,
    message: 'Room created successfully'
  });
});

// Get room info
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({
      success: true,
      room
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  // User joins a room
  socket.on('join-room', ({ roomId, userId, userType, userName }) => {
    console.log(`👤 ${userName} (${userType}) joining room: ${roomId}`);
    
    // Join the socket room
    socket.join(roomId);
    
    // Store user information
    users.set(socket.id, {
      userId,
      userType,
      userName,
      roomId,
      socketId: socket.id
    });
    
    // Update room participants
    const room = rooms.get(roomId) || {
      id: roomId,
      participants: [],
      createdAt: new Date().toISOString()
    };
    
    room.participants.push({
      socketId: socket.id,
      userId,
      userType,
      userName,
      joinedAt: new Date().toISOString()
    });
    
    rooms.set(roomId, room);
    
    // Get other users in the room
    const otherUsers = room.participants.filter(p => p.socketId !== socket.id);
    
    // Notify the joining user about existing participants
    socket.emit('room-joined', {
      roomId,
      participants: otherUsers
    });
    
    // Notify other users in the room about the new participant
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userType,
      userName
    });
    
    console.log(`📊 Room ${roomId} now has ${room.participants.length} participant(s)`);
  });
  
  // Handle WebRTC offer
  socket.on('offer', ({ offer, to }) => {
    console.log(`📤 Sending offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', {
      offer,
      from: socket.id,
      fromUser: users.get(socket.id)
    });
  });
  
  // Handle WebRTC answer
  socket.on('answer', ({ answer, to }) => {
    console.log(`📤 Sending answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', {
      answer,
      from: socket.id,
      fromUser: users.get(socket.id)
    });
  });
  
  // Handle ICE candidate
  socket.on('ice-candidate', ({ candidate, to }) => {
    console.log(`🧊 Sending ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });
  
  // Handle call start
  socket.on('start-call', ({ roomId }) => {
    const user = users.get(socket.id);
    console.log(`📞 Call started in room ${roomId} by ${user?.userName}`);
    
    socket.to(roomId).emit('call-started', {
      from: socket.id,
      fromUser: user
    });
  });
  
  // Handle call end
  socket.on('end-call', ({ roomId }) => {
    const user = users.get(socket.id);
    console.log(`📴 Call ended in room ${roomId} by ${user?.userName}`);
    
    socket.to(roomId).emit('call-ended', {
      from: socket.id,
      fromUser: user
    });
  });
  
  // Handle toggle video
  socket.on('toggle-video', ({ roomId, enabled }) => {
    const user = users.get(socket.id);
    console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'} by ${user?.userName}`);
    
    socket.to(roomId).emit('peer-toggle-video', {
      from: socket.id,
      enabled
    });
  });
  
  // Handle toggle audio
  socket.on('toggle-audio', ({ roomId, enabled }) => {
    const user = users.get(socket.id);
    console.log(`🎤 Audio ${enabled ? 'enabled' : 'disabled'} by ${user?.userName}`);
    
    socket.to(roomId).emit('peer-toggle-audio', {
      from: socket.id,
      enabled
    });
  });
  
  // Handle screen share
  socket.on('start-screen-share', ({ roomId }) => {
    const user = users.get(socket.id);
    console.log(`🖥️ Screen share started by ${user?.userName}`);
    
    socket.to(roomId).emit('peer-screen-share-started', {
      from: socket.id,
      fromUser: user
    });
  });
  
  socket.on('stop-screen-share', ({ roomId }) => {
    const user = users.get(socket.id);
    console.log(`🖥️ Screen share stopped by ${user?.userName}`);
    
    socket.to(roomId).emit('peer-screen-share-stopped', {
      from: socket.id
    });
  });
  
  // Handle chat messages during call
  socket.on('call-message', ({ roomId, message }) => {
    const user = users.get(socket.id);
    console.log(`💬 Message in room ${roomId} from ${user?.userName}: ${message}`);
    
    socket.to(roomId).emit('call-message', {
      from: socket.id,
      fromUser: user,
      message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    const user = users.get(socket.id);
    if (user) {
      const { roomId } = user;
      
      // Notify others in the room
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        user
      });
      
      // Update room participants
      const room = rooms.get(roomId);
      if (room) {
        room.participants = room.participants.filter(p => p.socketId !== socket.id);
        
        // Delete room if empty
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (empty)`);
        } else {
          rooms.set(roomId, room);
        }
      }
      
      // Remove user
      users.delete(socket.id);
    }
  });
  
  // Handle leave room
  socket.on('leave-room', ({ roomId }) => {
    const user = users.get(socket.id);
    console.log(`👋 ${user?.userName} leaving room ${roomId}`);
    
    socket.leave(roomId);
    
    // Notify others
    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      user
    });
    
    // Update room
    const room = rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      
      if (room.participants.length === 0) {
        rooms.delete(roomId);
        console.log(`🗑️ Room ${roomId} deleted (empty)`);
      } else {
        rooms.set(roomId, room);
      }
    }
    
    users.delete(socket.id);
  });
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🎥 HealthConnect Signaling Server');
  console.log('========================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing server');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT signal received: closing server');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
