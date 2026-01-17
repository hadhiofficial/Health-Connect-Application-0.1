/**
 * HealthConnect - WebRTC Service
 * Manages video call connections and media streams
 */

import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:4000';

// ICE servers configuration (using Google's public STUN servers)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.roomId = null;
    this.userId = null;
    this.userType = null;
    this.userName = null;
    this.remotePeerId = null;
    
    // Callbacks
    this.onLocalStream = null;
    this.onRemoteStream = null;
    this.onCallEnded = null;
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onError = null;
    this.onConnectionStateChange = null;
  }

  /**
   * Initialize Socket.io connection
   */
  initializeSocket() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupSocketListeners();
    return this.socket;
  }

  /**
   * Setup Socket.io event listeners
   */
  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to signaling server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from signaling server');
    });

    this.socket.on('room-joined', ({ roomId, participants }) => {
      console.log(`📥 Joined room ${roomId}. ${participants.length} other participant(s)`);
      
      // If there are other participants, we need to create an offer
      if (participants.length > 0) {
        this.remotePeerId = participants[0].socketId;
        this.createOffer();
      }
    });

    this.socket.on('user-joined', async ({ socketId, userId, userType, userName }) => {
      console.log(`👤 User joined: ${userName} (${userType})`);
      this.remotePeerId = socketId;
      
      if (this.onUserJoined) {
        this.onUserJoined({ socketId, userId, userType, userName });
      }
    });

    this.socket.on('user-left', ({ socketId, user }) => {
      console.log(`👋 User left: ${user?.userName}`);
      
      if (this.onUserLeft) {
        this.onUserLeft({ socketId, user });
      }
      
      this.handlePeerDisconnect();
    });

    this.socket.on('offer', async ({ offer, from, fromUser }) => {
      console.log(`📥 Received offer from ${fromUser?.userName}`);
      this.remotePeerId = from;
      await this.handleOffer(offer);
    });

    this.socket.on('answer', async ({ answer, from }) => {
      console.log(`📥 Received answer from ${from}`);
      await this.handleAnswer(answer);
    });

    this.socket.on('ice-candidate', async ({ candidate, from }) => {
      console.log(`🧊 Received ICE candidate from ${from}`);
      await this.handleIceCandidate(candidate);
    });

    this.socket.on('call-ended', ({ from, fromUser }) => {
      console.log(`📴 Call ended by ${fromUser?.userName}`);
      
      if (this.onCallEnded) {
        this.onCallEnded({ from, fromUser });
      }
    });

    this.socket.on('peer-toggle-video', ({ from, enabled }) => {
      console.log(`📹 Peer video ${enabled ? 'enabled' : 'disabled'}`);
      // This can be used to show/hide remote video UI
    });

    this.socket.on('peer-toggle-audio', ({ from, enabled }) => {
      console.log(`🎤 Peer audio ${enabled ? 'enabled' : 'disabled'}`);
      // This can be used to show mute indicator
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      if (this.onError) {
        this.onError(error);
      }
    });
  }

  /**
   * Join a video call room
   */
  async joinRoom(roomId, userId, userType, userName) {
    this.roomId = roomId;
    this.userId = userId;
    this.userType = userType;
    this.userName = userName;

    // Initialize socket if not already done
    this.initializeSocket();

    // Get local media stream
    await this.startLocalStream();

    // Join the room via socket
    this.socket.emit('join-room', {
      roomId,
      userId,
      userType,
      userName
    });

    return true;
  }

  /**
   * Start local media stream (camera and microphone)
   */
  async startLocalStream() {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Local stream started');

      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      
      if (this.onError) {
        this.onError({
          type: 'MEDIA_ACCESS_ERROR',
          message: 'Could not access camera or microphone. Please check permissions.',
          error
        });
      }
      
      throw error;
    }
  }

  /**
   * Create WebRTC peer connection
   */
  createPeerConnection() {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        this.socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: this.remotePeerId
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📥 Received remote track');
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
      
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log(`🔗 Connection state: ${state}`);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
      
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.handlePeerDisconnect();
      }
    };

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state: ${this.peerConnection.iceConnectionState}`);
    };

    return this.peerConnection;
  }

  /**
   * Create and send offer
   */
  async createOffer() {
    try {
      this.createPeerConnection();
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('📤 Sending offer');
      this.socket.emit('offer', {
        offer,
        to: this.remotePeerId
      });
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      if (this.onError) {
        this.onError({ type: 'OFFER_ERROR', error });
      }
    }
  }

  /**
   * Handle incoming offer
   */
  async handleOffer(offer) {
    try {
      this.createPeerConnection();
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('📤 Sending answer');
      this.socket.emit('answer', {
        answer,
        to: this.remotePeerId
      });
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      if (this.onError) {
        this.onError({ type: 'ANSWER_ERROR', error });
      }
    }
  }

  /**
   * Handle incoming answer
   */
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Answer processed');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      if (this.onError) {
        this.onError({ type: 'ANSWER_PROCESSING_ERROR', error });
      }
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  /**
   * Toggle video on/off
   */
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        
        this.socket.emit('toggle-video', {
          roomId: this.roomId,
          enabled: videoTrack.enabled
        });
        
        return videoTrack.enabled;
      }
    }
    return false;
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        
        this.socket.emit('toggle-audio', {
          roomId: this.roomId,
          enabled: audioTrack.enabled
        });
        
        return audioTrack.enabled;
      }
    }
    return false;
  }

  /**
   * End the call
   */
  endCall() {
    console.log('📴 Ending call');
    
    // Notify other peer
    if (this.socket && this.roomId) {
      this.socket.emit('end-call', { roomId: this.roomId });
    }
    
    this.cleanup();
  }

  /**
   * Handle peer disconnect
   */
  handlePeerDisconnect() {
    console.log('⚠️ Peer disconnected');
    this.cleanup();
  }

  /**
   * Leave room
   */
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId });
    }
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear remote stream
    this.remoteStream = null;
    this.remotePeerId = null;
  }

  /**
   * Disconnect from signaling server
   */
  disconnect() {
    this.cleanup();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.roomId = null;
    this.userId = null;
    this.userType = null;
    this.userName = null;
  }

  /**
   * Check if video is enabled
   */
  isVideoEnabled() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      return videoTrack ? videoTrack.enabled : false;
    }
    return false;
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }
}

export default new WebRTCService();
