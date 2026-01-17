/**
 * HealthConnect - Video Call Component
 * WebRTC-based video calling for doctor-patient consultations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import webrtcService from '../services/webrtc.service';
import './VideoCall.css';

const VideoCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // State
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState('new');
  const [remotePeerConnected, setRemotePeerConnected] = useState(false);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserInfo, setRemoteUserInfo] = useState(null);
  
  // Get call details from navigation state or localStorage
  const callDetails = location.state?.callDetails || JSON.parse(localStorage.getItem('currentCall') || '{}');
  const { roomId, userId, userType, userName, remoteName } = callDetails;
  
  // Timer ref
  const timerRef = useRef(null);

  useEffect(() => {
    // Validate call details
    if (!roomId || !userId || !userType || !userName) {
      setError('Invalid call details. Please start a call from the dashboard.');
      return;
    }

    // Store call details
    localStorage.setItem('currentCall', JSON.stringify(callDetails));

    // Setup WebRTC service callbacks
    setupWebRTCCallbacks();

    // Join the room
    initializeCall();

    // Cleanup on unmount
    return () => {
      handleEndCall();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /**
   * Setup WebRTC service callbacks
   */
  const setupWebRTCCallbacks = () => {
    // Local stream callback
    webrtcService.onLocalStream = (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    // Remote stream callback
    webrtcService.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setRemotePeerConnected(true);
        startCallTimer();
      }
    };

    // Connection state change callback
    webrtcService.onConnectionStateChange = (state) => {
      setConnectionState(state);
      if (state === 'connected') {
        setIsCallActive(true);
        setIsConnecting(false);
      } else if (state === 'failed' || state === 'disconnected') {
        setError('Connection lost. Please try again.');
        setRemotePeerConnected(false);
      }
    };

    // User joined callback
    webrtcService.onUserJoined = ({ userId, userType, userName }) => {
      setRemoteUserInfo({ userId, userType, userName });
      console.log(`User joined: ${userName}`);
    };

    // User left callback
    webrtcService.onUserLeft = ({ user }) => {
      setRemotePeerConnected(false);
      setError(`${user?.userName || 'Remote user'} has left the call.`);
      setTimeout(() => {
        handleEndCall();
      }, 3000);
    };

    // Call ended callback
    webrtcService.onCallEnded = ({ fromUser }) => {
      setError(`${fromUser?.userName || 'Remote user'} has ended the call.`);
      setTimeout(() => {
        handleEndCall();
      }, 2000);
    };

    // Error callback
    webrtcService.onError = (errorObj) => {
      console.error('WebRTC Error:', errorObj);
      setError(errorObj.message || 'An error occurred during the call.');
      setIsConnecting(false);
    };
  };

  /**
   * Initialize the call
   */
  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      await webrtcService.joinRoom(roomId, userId, userType, userName);
      
      console.log('✅ Successfully joined call room');
      setIsConnecting(false);
    } catch (err) {
      console.error('❌ Failed to initialize call:', err);
      setError('Failed to start call. Please check your camera and microphone permissions.');
      setIsConnecting(false);
    }
  };

  /**
   * Start call duration timer
   */
  const startCallTimer = () => {
    if (timerRef.current) return; // Already started
    
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  /**
   * Format call duration
   */
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Toggle video on/off
   */
  const handleToggleVideo = () => {
    const enabled = webrtcService.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  /**
   * Toggle audio on/off
   */
  const handleToggleAudio = () => {
    const enabled = webrtcService.toggleAudio();
    setIsAudioEnabled(enabled);
  };

  /**
   * End the call
   */
  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    webrtcService.endCall();
    localStorage.removeItem('currentCall');
    
    // Navigate back to dashboard
    const dashboardPath = userType === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
    navigate(dashboardPath, {
      state: {
        message: 'Call ended',
        callDuration: formatDuration(callDuration)
      }
    });
  };

  /**
   * Go back without starting call
   */
  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave? The call will be ended.')) {
      handleEndCall();
    }
  };

  return (
    <div className="video-call-container">
      {/* Header */}
      <div className="video-call-header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <h2>Video Call</h2>
        <div className="call-info">
          {isCallActive && (
            <span className="call-duration">
              ⏱️ {formatDuration(callDuration)}
            </span>
          )}
        </div>
      </div>

      {/* Video Streams Container */}
      <div className="video-streams">
        {/* Remote Video (Main) */}
        <div className="remote-video-container">
          {remotePeerConnected ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video"
              />
              <div className="remote-user-info">
                <span className="remote-user-name">
                  {remoteUserInfo?.userName || remoteName || 'Remote User'}
                </span>
                <span className="remote-user-type">
                  {remoteUserInfo?.userType === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
                </span>
              </div>
            </>
          ) : (
            <div className="waiting-screen">
              <div className="waiting-animation">
                <div className="spinner"></div>
              </div>
              <h3>
                {isConnecting 
                  ? 'Connecting...' 
                  : 'Waiting for the other person to join...'}
              </h3>
              <p>Room ID: {roomId}</p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="local-user-label">You</div>
          {!isVideoEnabled && (
            <div className="video-off-overlay">
              <span>📷 Camera Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <div className="controls-wrapper">
          {/* Video Toggle */}
          <button
            className={`control-button ${!isVideoEnabled ? 'disabled' : ''}`}
            onClick={handleToggleVideo}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            <span className="control-icon">
              {isVideoEnabled ? '📹' : '📷'}
            </span>
            <span className="control-label">
              {isVideoEnabled ? 'Camera On' : 'Camera Off'}
            </span>
          </button>

          {/* Audio Toggle */}
          <button
            className={`control-button ${!isAudioEnabled ? 'disabled' : ''}`}
            onClick={handleToggleAudio}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            <span className="control-icon">
              {isAudioEnabled ? '🎤' : '🔇'}
            </span>
            <span className="control-label">
              {isAudioEnabled ? 'Mic On' : 'Mic Off'}
            </span>
          </button>

          {/* End Call */}
          <button
            className="control-button end-call-button"
            onClick={handleEndCall}
            title="End call"
          >
            <span className="control-icon">📞</span>
            <span className="control-label">End Call</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionState !== 'connected' && connectionState !== 'new' && (
        <div className="connection-status">
          <span className={`status-indicator ${connectionState}`}>
            {connectionState === 'connecting' && '🔄 Connecting...'}
            {connectionState === 'disconnected' && '⚠️ Disconnected'}
            {connectionState === 'failed' && '❌ Connection Failed'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Info Overlay */}
      {!error && !remotePeerConnected && (
        <div className="info-overlay">
          <div className="info-card">
            <h3>📞 Waiting for Connection</h3>
            <p>Share this Room ID with the other person:</p>
            <div className="room-id-display">
              <code>{roomId}</code>
              <button
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  alert('Room ID copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
            </div>
            <div className="connection-tips">
              <h4>Tips:</h4>
              <ul>
                <li>✅ Make sure your camera and microphone are enabled</li>
                <li>✅ Check your internet connection</li>
                <li>✅ The other person must join the same room</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
