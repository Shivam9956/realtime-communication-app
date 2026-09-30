import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

// Default public STUN servers
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = (meetingId, user) => {
  const { socket } = useSocket();

  // Local media stream & states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  // References to preserve instances across renders
  const peerConnections = useRef({}); // { [socketId]: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const webcamTrackRef = useRef(null);
  const pendingIceCandidates = useRef({}); // { [socketId]: Array<RTCIceCandidate> }

  // 1. Initialize Local Camera / Microphone MediaStream
  const startLocalMedia = useCallback(async () => {
    try {
      setMediaError(null);
      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (videoError) {
        console.warn('Could not get video+audio stream, falling back to audio-only:', videoError);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });
        setIsVideoEnabled(false);
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) webcamTrackRef.current = vTrack;

      return stream;
    } catch (err) {
      console.error('Failed to get user media devices:', err);
      setMediaError(
        'Could not access camera or microphone. Please check browser device permissions.'
      );
      return null;
    }
  }, []);

  // 2. Create and configure RTCPeerConnection for a remote peer
  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      if (peerConnections.current[remoteSocketId]) {
        return peerConnections.current[remoteSocketId];
      }

      console.log(`[WebRTC] Creating RTCPeerConnection for peer [${remoteSocketId}]`);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current[remoteSocketId] = pc;

      // Add local stream tracks to this peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming remote media tracks
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote track from peer [${remoteSocketId}]:`, event.track.kind);
        const remoteStream = event.streams[0] || new MediaStream([event.track]);

        setRemoteStreams((prev) => ({
          ...prev,
          [remoteSocketId]: remoteStream,
        }));
      };

      // Handle ICE Candidate generation
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            targetSocketId: remoteSocketId,
            candidate: event.candidate,
            meetingId,
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Peer [${remoteSocketId}] connection state: ${pc.connectionState}`);
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed'
        ) {
          removePeerConnection(remoteSocketId);
        }
      };

      return pc;
    },
    [socket, meetingId]
  );

  // 3. Remove peer connection on peer leave or disconnect
  const removePeerConnection = useCallback((remoteSocketId) => {
    if (peerConnections.current[remoteSocketId]) {
      console.log(`[WebRTC] Closing peer connection for [${remoteSocketId}]`);
      try {
        peerConnections.current[remoteSocketId].close();
      } catch (e) {
        // ignore close error
      }
      delete peerConnections.current[remoteSocketId];
    }

    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[remoteSocketId];
      return updated;
    });

    delete pendingIceCandidates.current[remoteSocketId];
  }, []);

  // 4. WebRTC Signaling event listeners
  useEffect(() => {
    if (!socket || !meetingId) return;

    // A) Received WebRTC Offer from a remote peer
    const handleReceiveOffer = async ({ fromSocketId, offer }) => {
      console.log(`[WebRTC] Received offer from [${fromSocketId}]`);
      try {
        const pc = createPeerConnection(fromSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process any queued ICE candidates
        if (pendingIceCandidates.current[fromSocketId]) {
          for (const cand of pendingIceCandidates.current[fromSocketId]) {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          }
          pendingIceCandidates.current[fromSocketId] = [];
        }

        // Create & send Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: fromSocketId,
          answer,
          meetingId,
        });
      } catch (err) {
        console.error(`[WebRTC] Error handling offer from [${fromSocketId}]:`, err);
      }
    };

    // B) Received WebRTC Answer from remote peer
    const handleReceiveAnswer = async ({ fromSocketId, answer }) => {
      console.log(`[WebRTC] Received answer from [${fromSocketId}]`);
      try {
        const pc = peerConnections.current[fromSocketId];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process queued ICE candidates
          if (pendingIceCandidates.current[fromSocketId]) {
            for (const cand of pendingIceCandidates.current[fromSocketId]) {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            pendingIceCandidates.current[fromSocketId] = [];
          }
        }
      } catch (err) {
        console.error(`[WebRTC] Error handling answer from [${fromSocketId}]:`, err);
      }
    };

    // C) Received ICE Candidate
    const handleReceiveIceCandidate = async ({ fromSocketId, candidate }) => {
      try {
        const pc = peerConnections.current[fromSocketId];
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate until remote description is set
          if (!pendingIceCandidates.current[fromSocketId]) {
            pendingIceCandidates.current[fromSocketId] = [];
          }
          pendingIceCandidates.current[fromSocketId].push(candidate);
        }
      } catch (err) {
        console.error(`[WebRTC] Error adding ICE candidate:`, err);
      }
    };

    // D) When a new participant joins, the host/existing peer initiates an offer
    const handlePeerJoined = async ({ participant }) => {
      if (!participant?.socketId || participant.socketId === socket.id) return;
      const remoteSocketId = participant.socketId;
      console.log(`[WebRTC] Initiating offer to newly joined peer [${remoteSocketId}]`);

      try {
        const pc = createPeerConnection(remoteSocketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
          targetSocketId: remoteSocketId,
          offer,
          meetingId,
        });
      } catch (err) {
        console.error(`[WebRTC] Failed to create offer for peer [${remoteSocketId}]:`, err);
      }
    };

    // E) Peer left
    const handlePeerLeft = ({ socketId }) => {
      if (socketId) {
        removePeerConnection(socketId);
      }
    };

    socket.on('webrtc-offer', handleReceiveOffer);
    socket.on('webrtc-answer', handleReceiveAnswer);
    socket.on('ice-candidate', handleReceiveIceCandidate);
    socket.on('participant-joined', handlePeerJoined);
    socket.on('participant-left', handlePeerLeft);

    return () => {
      socket.off('webrtc-offer', handleReceiveOffer);
      socket.off('webrtc-answer', handleReceiveAnswer);
      socket.off('ice-candidate', handleReceiveIceCandidate);
      socket.off('participant-joined', handlePeerJoined);
      socket.off('participant-left', handlePeerLeft);
    };
  }, [socket, meetingId, createPeerConnection, removePeerConnection]);

  // 5. Toggle Microphone
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks.forEach((track) => {
          track.enabled = nextState;
        });
        setIsAudioEnabled(nextState);
        return nextState;
      }
    }
    return isAudioEnabled;
  }, [isAudioEnabled]);

  // 6. Toggle Camera
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
          track.enabled = nextState;
        });
        setIsVideoEnabled(nextState);
        return nextState;
      }
    }
    return isVideoEnabled;
  }, [isVideoEnabled]);

  // 7. Toggle Screen Share with Seamless Track Replacement
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop Screen Sharing -> Restore Webcam
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      if (webcamTrackRef.current) {
        // Replace screen track back to webcam on all active peer connections
        Object.values(peerConnections.current).forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(webcamTrackRef.current);
          }
        });
      }

      setIsScreenSharing(false);
      return false;
    } else {
      // Start Screen Share
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        // Auto-stop when user clicks browser's native "Stop sharing" bar
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        // Replace webcam video track with screen track on all peer senders
        Object.values(peerConnections.current).forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });

        setIsScreenSharing(true);
        return true;
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
        return false;
      }
    }
  }, [isScreenSharing]);

  // 8. Cleanup on meeting leave or component unmount
  const cleanupMedia = useCallback(() => {
    // Stop local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    // Close all RTCPeerConnections
    Object.values(peerConnections.current).forEach((pc) => {
      try {
        pc.close();
      } catch (e) {}
    });
    peerConnections.current = {};
    setRemoteStreams({});
    setLocalStream(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    mediaError,
    startLocalMedia,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanupMedia,
  };
};

export default useWebRTC;
