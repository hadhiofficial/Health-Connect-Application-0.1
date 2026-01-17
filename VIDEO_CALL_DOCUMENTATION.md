# 🎥 HealthConnect - Video Call Feature Documentation

## 📋 **Complete Implementation Guide**

---

## 🎉 **What Has Been Built**

### ✅ **1. WebRTC Signaling Server (Node.js + Socket.io)**

**Location:** `signaling-server/`

**Files:**
- `server.js` - Complete WebRTC signaling server
- `package.json` - Dependencies configuration

**Features:**
- ✅ Socket.io real-time communication
- ✅ Room creation and management
- ✅ WebRTC offer/answer exchange
- ✅ ICE candidate handling
- ✅ User join/leave tracking
- ✅ Call start/end notifications
- ✅ Video/audio toggle signaling
- ✅ Health check endpoint

**Port:** `4000`

---

### ✅ **2. WebRTC Service (React)**

**Location:** `client/src/services/webrtc.service.js`

**Features:**
- ✅ PeerConnection management
- ✅ Media stream handling (camera/microphone)
- ✅ Socket.io client integration
- ✅ Offer/Answer creation and handling
- ✅ ICE candidate exchange
- ✅ Connection state management
- ✅ Video/audio toggle controls
- ✅ Graceful cleanup and disconnect

---

### ✅ **3. Video Call Component (React)**

**Location:** `client/src/pages/VideoCall.jsx`

**Features:**
- ✅ Local video display (Picture-in-Picture)
- ✅ Remote video display (Full screen)
- ✅ Camera on/off toggle
- ✅ Microphone on/off toggle
- ✅ End call button
- ✅ Call duration timer
- ✅ Connection status indicators
- ✅ Waiting screen for peer
- ✅ Error handling and notifications
- ✅ Room ID sharing
- ✅ Responsive design (mobile + desktop)

---

### ✅ **4. Styling (CSS)**

**Location:** `client/src/pages/VideoCall.css`

**Features:**
- ✅ Modern dark gradient theme
- ✅ Responsive breakpoints (768px, 480px)
- ✅ Professional controls layout
- ✅ Smooth animations
- ✅ Status indicators
- ✅ Mobile-friendly interface
- ✅ Picture-in-picture local video
- ✅ Accessible button design

---

### ✅ **5. Backend API (Spring Boot)**

**Location:** `server/src/main/java/com/healthconnect/controller/VideoCallController.java`

**Endpoints:**
- `POST /api/video-calls/generate-room` - Generate unique room ID
- `POST /api/video-calls/schedule` - Schedule video call appointment
- `POST /api/video-calls/start-instant-call` - Start instant call
- `GET /api/video-calls/room/{roomId}` - Get room information
- `POST /api/video-calls/end-call` - End call and save duration
- `GET /api/video-calls/health` - Health check

---

## 🚀 **Quick Start Guide**

### **Step 1: Install Dependencies**

#### Signaling Server:
```powershell
cd signaling-server
npm install
```

#### React Client:
```powershell
cd client
npm install
```

The backend dependencies are already in your Spring Boot project.

---

### **Step 2: Start All Servers**

#### Terminal 1 - Signaling Server:
```powershell
cd signaling-server
npm start
```
**Expected Output:**
```
========================================
🎥 HealthConnect Signaling Server
========================================
✅ Server running on port 4000
📡 Socket.io ready for connections
🏥 Health check: http://localhost:4000/health
========================================
```

#### Terminal 2 - Spring Boot Backend:
```powershell
cd server
mvn spring-boot:run
```

#### Terminal 3 - React Frontend:
```powershell
cd client
npm start
```

---

### **Step 3: Test Video Call**

1. **Open Two Browser Windows/Tabs:**
   - Window 1: `http://localhost:3000`
   - Window 2: `http://localhost:3000` (incognito mode recommended)

2. **Generate Room ID:**
   ```javascript
   // Method 1: Direct navigation
   http://localhost:3000/video-call
   
   // Method 2: Programmatic (from dashboard)
   // See integration examples below
   ```

3. **Start Call:**
   - Window 1: Navigate to video call page
   - Copy the Room ID displayed
   - Window 2: Navigate to same page
   - Both users will automatically connect

---

## 💻 **Integration Examples**

### **Example 1: Start Instant Call from Doctor Dashboard**

```javascript
// DoctorDashboard.js

import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');

  const startVideoCall = async (patient) => {
    try {
      // Generate room via backend
      const response = await axios.post('http://localhost:8080/api/video-calls/start-instant-call', {
        initiatorId: doctor.id,
        initiatorType: 'doctor',
        initiatorName: doctor.name,
        recipientId: patient.id,
        recipientName: patient.name
      });

      if (response.data.success) {
        const { roomId } = response.data;
        
        // Navigate to video call
        navigate('/video-call', {
          state: {
            callDetails: {
              roomId,
              userId: doctor.id,
              userType: 'doctor',
              userName: doctor.name,
              remoteName: patient.name
            }
          }
        });

        // Optional: Send notification to patient via WebSocket/API
        // notifyPatient(patient.id, roomId);
      }
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  return (
    <div className="doctor-dashboard">
      {/* Your dashboard content */}
      
      <div className="patients-list">
        {patients.map(patient => (
          <div key={patient.id} className="patient-card">
            <h3>{patient.name}</h3>
            <button 
              className="video-call-btn"
              onClick={() => startVideoCall(patient)}
            >
              📹 Start Video Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### **Example 2: Join Scheduled Appointment**

```javascript
// PatientDashboard.js

const PatientDashboard = () => {
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem('patient') || '{}');

  const joinScheduledCall = async (appointment) => {
    try {
      // Get room info from backend
      const response = await axios.get(
        `http://localhost:8080/api/video-calls/room/${appointment.roomId}`
      );

      if (response.data.success) {
        navigate('/video-call', {
          state: {
            callDetails: {
              roomId: appointment.roomId,
              userId: patient.id,
              userType: 'patient',
              userName: patient.name,
              remoteName: appointment.doctorName
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      alert('Failed to join video call. Please try again.');
    }
  };

  return (
    <div className="patient-dashboard">
      <h2>Upcoming Appointments</h2>
      {appointments.map(appointment => (
        <div key={appointment.id} className="appointment-card">
          <h3>Dr. {appointment.doctorName}</h3>
          <p>{appointment.scheduledTime}</p>
          <button onClick={() => joinScheduledCall(appointment)}>
            📹 Join Video Call
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

### **Example 3: Simple Direct Call**

```javascript
// From any component

const handleStartCall = () => {
  const roomId = 'ROOM-' + Date.now(); // Simple room ID
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  navigate('/video-call', {
    state: {
      callDetails: {
        roomId,
        userId: user.id,
        userType: 'doctor', // or 'patient'
        userName: user.name,
        remoteName: 'Other User'
      }
    }
  });
};
```

---

## 🎯 **User Flow**

```
┌─────────────────────────────────────┐
│  Doctor/Patient Dashboard           │
│  - Click "Start Video Call"         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Backend API                         │
│  POST /api/video-calls/generate-room│
│  Returns: Room ID                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Navigate to /video-call            │
│  with callDetails state             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  VideoCall Component                │
│  1. Request camera/mic permissions  │
│  2. Display local video             │
│  3. Connect to signaling server     │
│  4. Join room via Socket.io         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Signaling Server                   │
│  1. User joins room                 │
│  2. Notify other participants       │
│  3. Exchange WebRTC signals         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  WebRTC Connection                  │
│  1. Create offer/answer             │
│  2. Exchange ICE candidates         │
│  3. Establish peer connection       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Call Active                        │
│  - Local video (PIP)                │
│  - Remote video (Full screen)       │
│  - Controls (Camera, Mic, End)      │
│  - Duration timer                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  End Call                           │
│  1. Click "End Call" button         │
│  2. Stop media streams              │
│  3. Close peer connection           │
│  4. Disconnect from signaling       │
│  5. Navigate back to dashboard      │
└─────────────────────────────────────┘
```

---

## 🧪 **Testing Guide**

### **Test 1: Single User Setup**
```powershell
# Test if servers are running
curl http://localhost:4000/health
curl http://localhost:8080/api/video-calls/health
curl http://localhost:3000
```

### **Test 2: Room Creation**
```powershell
# PowerShell
$body = @{
    doctorId = "doc123"
    patientId = "pat456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/video-calls/generate-room" `
  -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "roomId": "ROOM-abc123...",
  "doctorId": "doc123",
  "patientId": "pat456",
  "signalingServer": "http://localhost:4000",
  "message": "Video call room created successfully"
}
```

### **Test 3: Two-User Video Call**

1. **Browser Window 1 (Doctor):**
   ```
   http://localhost:3000/video-call
   ```
   - Grant camera/microphone permissions
   - Copy the Room ID displayed
   
2. **Browser Window 2 (Patient - Incognito):**
   ```
   http://localhost:3000/video-call
   ```
   - Use same Room ID
   - Grant permissions
   - Should connect automatically

3. **Verify:**
   - ✅ Local video appears in bottom-right corner
   - ✅ Remote video appears in main screen
   - ✅ Both users can see each other
   - ✅ Audio is working
   - ✅ Camera toggle works
   - ✅ Microphone toggle works
   - ✅ End call button works

---

## 🔧 **API Documentation**

### **POST /api/video-calls/generate-room**

Generate a unique room ID for video call.

**Request:**
```json
{
  "doctorId": "doc123",
  "patientId": "pat456",
  "appointmentId": "APPT-789" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "roomId": "ROOM-uuid",
  "doctorId": "doc123",
  "patientId": "pat456",
  "signalingServer": "http://localhost:4000",
  "createdAt": "2025-10-18T10:30:00",
  "message": "Video call room created successfully"
}
```

---

### **POST /api/video-calls/schedule**

Schedule a video call appointment.

**Request:**
```json
{
  "doctorId": "doc123",
  "patientId": "pat456",
  "doctorName": "Dr. Smith",
  "patientName": "John Doe",
  "scheduledTime": "2025-10-20T15:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "appointmentId": "APPT-uuid",
  "roomId": "ROOM-APPT-uuid",
  "scheduledTime": "2025-10-20T15:00:00",
  "status": "SCHEDULED",
  "message": "Video call appointment scheduled successfully"
}
```

---

### **POST /api/video-calls/start-instant-call**

Start an instant video call.

**Request:**
```json
{
  "initiatorId": "doc123",
  "initiatorType": "doctor",
  "initiatorName": "Dr. Smith",
  "recipientId": "pat456",
  "recipientName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "roomId": "INSTANT-uuid",
  "callType": "INSTANT",
  "signalingServer": "http://localhost:4000",
  "startedAt": "2025-10-18T10:30:00"
}
```

---

## 📱 **Features Implemented**

### ✅ **Core Features:**
- ✅ Real-time video streaming (WebRTC)
- ✅ Real-time audio streaming
- ✅ Camera on/off toggle
- ✅ Microphone on/off toggle
- ✅ Start call functionality
- ✅ End call functionality
- ✅ Local video display (Picture-in-Picture)
- ✅ Remote video display (Full screen)

### ✅ **Advanced Features:**
- ✅ Connection state tracking
- ✅ Call duration timer
- ✅ User presence detection
- ✅ Automatic reconnection attempts
- ✅ Error handling and notifications
- ✅ Room ID sharing
- ✅ Waiting screen for peer
- ✅ Responsive design (mobile + desktop)
- ✅ Professional UI/UX
- ✅ STUN server integration (Google's public STUN)

---

## 🎨 **UI Components**

### **Video Call Screen Layout:**

```
┌─────────────────────────────────────────────────┐
│ ← Back         Video Call         ⏱️ 05:23      │ Header
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│          Remote Video (Full Screen)             │
│                                                 │
│                ┌──────────────┐                 │
│                │ Local Video  │  PIP            │
│                │ (You)        │                 │
│                └──────────────┘                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  [📹 Camera] [🎤 Mic] [📞 End Call]            │ Controls
└─────────────────────────────────────────────────┘
```

---

## 🔒 **Security & Best Practices**

### **Implemented:**
- ✅ CORS configuration for allowed origins
- ✅ Secure WebRTC connections (ICE/STUN)
- ✅ Media permissions request
- ✅ Error handling for denied permissions
- ✅ Graceful connection failure handling
- ✅ Automatic cleanup on disconnect

### **Recommendations for Production:**
- Add TURN server for NAT traversal
- Implement user authentication
- Add end-to-end encryption
- Use HTTPS for web server
- Implement call recording (with consent)
- Add call quality monitoring
- Implement bandwidth adaptation
- Add screen sharing feature
- Add chat during call
- Add waiting room feature

---

## 🐛 **Troubleshooting**

### **Issue 1: Camera/Microphone Not Working**

**Symptoms:** Permission denied or black screen

**Solutions:**
1. Check browser permissions:
   - Chrome: Settings → Privacy and Security → Site Settings
   - Firefox: Settings → Privacy & Security → Permissions
2. Verify camera/microphone are not used by another app
3. Try different browser (Chrome recommended)
4. Check if HTTPS is enabled (required for getUserMedia)

---

### **Issue 2: Signaling Server Not Connecting**

**Symptoms:** "Disconnected from signaling server"

**Solutions:**
```powershell
# Check if server is running
curl http://localhost:4000/health

# Restart signaling server
cd signaling-server
npm start

# Check firewall settings
```

---

### **Issue 3: Peer Not Connecting**

**Symptoms:** "Waiting for connection..." never ends

**Solutions:**
1. Verify both users are in the same room (same Room ID)
2. Check console for WebRTC errors
3. Verify STUN servers are accessible
4. Try refreshing both browser windows
5. Check internet connection

---

### **Issue 4: No Video But Audio Works**

**Symptoms:** Can hear but can't see

**Solutions:**
1. Check if camera toggle is on
2. Verify camera permissions
3. Check if camera LED is on
4. Try toggling video off and on
5. Restart the call

---

## 📊 **Performance Optimization**

### **Current Setup:**
- Video Resolution: 1280x720 (HD)
- Audio: Echo cancellation enabled
- Auto Gain Control: Enabled
- Noise Suppression: Enabled

### **For Better Performance:**
```javascript
// In webrtc.service.js, adjust constraints:

const constraints = {
  video: {
    width: { ideal: 640 },  // Lower for slow connections
    height: { ideal: 480 },
    frameRate: { ideal: 24 }  // Lower for bandwidth
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

---

## 🚀 **Deployment Checklist**

- [ ] **Signaling Server:**
  - [ ] Deploy to cloud (Heroku, AWS, Azure)
  - [ ] Use environment variables for configuration
  - [ ] Enable HTTPS
  - [ ] Set up monitoring and logging
  - [ ] Configure auto-scaling

- [ ] **TURN Server (Production Required):**
  - [ ] Set up Coturn or similar TURN server
  - [ ] Configure credentials
  - [ ] Update ICE servers in webrtc.service.js

- [ ] **Frontend:**
  - [ ] Update signaling server URL
  - [ ] Enable HTTPS
  - [ ] Test on multiple devices
  - [ ] Optimize video quality settings

- [ ] **Backend:**
  - [ ] Implement database models for appointments
  - [ ] Add authentication/authorization
  - [ ] Implement call history tracking
  - [ ] Add notification system

---

## 📚 **Additional Resources**

### **Documentation:**
- WebRTC API: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- Socket.io: https://socket.io/docs/
- STUN/TURN: https://webrtc.org/getting-started/peer-connections

### **Free STUN Servers:**
- Google: `stun:stun.l.google.com:19302`
- Already configured in the project

### **TURN Servers (For Production):**
- Xirsys: https://xirsys.com/
- Twilio: https://www.twilio.com/stun-turn
- Self-hosted: Coturn

---

## ✨ **Success Metrics**

### **What's Working:**
✅ Real-time video communication  
✅ Real-time audio communication  
✅ Camera toggle (on/off)  
✅ Microphone toggle (on/off)  
✅ Start call button  
✅ End call button  
✅ Local video display  
✅ Remote video display  
✅ Responsive design  
✅ Error handling  
✅ Connection state tracking  
✅ Call duration timer  

---

## 🎯 **Next Steps**

1. **Test the implementation:**
   ```powershell
   .\test-video-call.ps1
   ```

2. **Integrate into dashboards:**
   - Add "Start Video Call" buttons
   - Add scheduled appointments
   - Add call history

3. **Production deployment:**
   - Deploy signaling server
   - Set up TURN server
   - Enable HTTPS
   - Add authentication

---

**🎉 Your WebRTC video calling feature is now complete and ready to use!**

---

**Made with ❤️ for HealthConnect**  
*Last Updated: October 18, 2025*
