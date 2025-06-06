// src/components/video/VideoCall.jsx

import React, { useEffect, useRef, useState } from "react";

// You can replace or add TURN servers here if available
const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  // { urls: "turn:your-turn-server.com:3478", username: "...", credential: "..." },
];

export default function VideoCall({ chatId, userId, friendId, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  // Determine initiator by simple ordering: lower userId starts the offer
  const isInitiator = userId < friendId;

  useEffect(() => {
    console.log("🌐 VideoCall mounted for chatId:", chatId, "userId:", userId, "friendId:", friendId);

    // 1. Acquire local media (camera + microphone)
    const initLocalStream = async () => {
      try {
        console.log("🎥 Requesting getUserMedia...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("🎥 Local stream acquired:", stream);
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          console.log("📺 Attached local stream to <video> element");
        }
      } catch (err) {
        console.error("❌ Error accessing media devices:", err);
        cleanup(); // Stop if we can't get camera/mic
      }
    };

    // 2. Create RTCPeerConnection and set up event handlers
    const createPeerConnection = () => {
      console.log("🛠️ Creating RTCPeerConnection...");
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
      pcRef.current = pc;

      // Add all local tracks to the PC
      if (localStream) {
        console.log("🔗 Adding local tracks to PeerConnection...");
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      // When new remote track arrives, attach to remote video element
      pc.ontrack = (event) => {
        console.log("📡 ontrack event:", event);
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          console.log("👥 Attached remote stream to <video> element");
        }
      };

      // When an ICE candidate is gathered, send it via WebSocket
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🕵️‍♂️ ICE candidate generated:", event.candidate);
          const payload = {
            type: "ice-candidate",
            candidate: event.candidate,
            to: friendId,
          };
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
            console.log("📨 Sent ICE candidate to peer:", payload);
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🌐 ICE connection state:", pc.iceConnectionState);
      };

      return pc;
    };

    // 3. Set up WebSocket for signaling
    const setupWebSocket = () => {
      // Make sure to use your actual backend URL + prefix
      const signalingUrl = `ws://localhost:8000/video/ws/video/${chatId}/${userId}`;
      console.log("🔌 Connecting to signaling WebSocket at:", signalingUrl);

      const ws = new WebSocket(signalingUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Video signaling WebSocket connected");

        // Once WS is open, create PC if not already
        if (!pcRef.current) {
          pcRef.current = createPeerConnection();
        }

        // If initiator, create and send an SDP offer
        if (isInitiator && pcRef.current) {
          console.log("🤝 Initiator: creating offer...");
          pcRef.current
            .createOffer()
            .then((offer) => {
              console.log("📝 Offer created:", offer);
              return pcRef.current.setLocalDescription(offer).then(() => offer);
            })
            .then((offer) => {
              const payload = {
                type: "offer",
                sdp: offer.sdp,
                to: friendId,
              };
              ws.send(JSON.stringify(payload));
              console.log("📨 Sent offer to peer:", payload);
            })
            .catch((err) => console.error("❌ Error during offer creation:", err));
        }
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 Received signaling message:", data);
        const pc = pcRef.current;
        if (!pc) {
          console.warn("⚠️ PeerConnection not ready yet; ignoring message");
          return;
        }

        switch (data.type) {
          case "offer":
            // Non-initiator receives offer, so set remote desc and answer
            if (!isInitiator) {
              console.log("🔄 Received offer, setting remote description...");
              await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: data.sdp }));
              console.log("🔄 Creating answer...");
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              console.log("📝 Answer created:", answer);
              const payload = {
                type: "answer",
                sdp: answer.sdp,
                to: friendId,
              };
              ws.send(JSON.stringify(payload));
              console.log("📨 Sent answer to peer:", payload);
            }
            break;

          case "answer":
            // Initiator receives answer
            if (isInitiator) {
              console.log("🔄 Received answer, setting remote description...");
              await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
              console.log("✅ Remote description (answer) set");
            }
            break;

          case "ice-candidate":
            // Add received ICE candidate
            try {
              console.log("🔄 Received ICE candidate:", data.candidate);
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              console.log("✅ ICE candidate added");
            } catch (err) {
              console.error("❌ Error adding received ICE candidate:", err);
            }
            break;

          default:
            console.warn("⚠️ Unknown signaling message type:", data.type);
        }
      };

      ws.onclose = () => {
        console.log("❌ Video signaling WebSocket closed");
      };

      ws.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
      };
    };

    // Initialize: get media then set up signaling
    (async () => {
      await initLocalStream();
      setupWebSocket();
    })();

    // Cleanup function
    const cleanup = () => {
      console.log("🧹 Cleaning up VideoCall resources...");
      // Close peer connection and stop all tracks
      if (pcRef.current) {
        console.log("🛑 Closing PeerConnection...");
        pcRef.current.getSenders().forEach((sender) => {
          if (sender.track) sender.track.stop();
        });
        pcRef.current.close();
        pcRef.current = null;
      }
      // Stop local stream tracks
      if (localStream) {
        console.log("🛑 Stopping local media tracks...");
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      // Close WebSocket
      if (wsRef.current) {
        console.log("🛑 Closing signaling WebSocket...");
        wsRef.current.close();
        wsRef.current = null;
      }
    };

    // Called when component unmounts or onClose is invoked
    return () => {
      cleanup();
      console.log("📤 Calling onClose() to hide VideoCall component");
      onClose();
    };
  }, [chatId, friendId, isInitiator, localStream, onClose, userId]);

  return (
    <div style={styles.container}>
      <div style={styles.videoContainer}>
        {/* Local preview */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={styles.localVideo}
        />
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={styles.remoteVideo}
        />
      </div>
      <button style={styles.hangupButton} onClick={onClose}>
        Hang Up
      </button>
    </div>
  );
}

// Inline styles (feel free to extract into CSS)
const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  videoContainer: {
    display: "flex",
    gap: "16px",
  },
  localVideo: {
    width: "240px",
    height: "180px",
    backgroundColor: "#000",
    borderRadius: "8px",
    objectFit: "cover",
  },
  remoteVideo: {
    width: "640px",
    height: "480px",
    backgroundColor: "#000",
    borderRadius: "8px",
    objectFit: "cover",
  },
  hangupButton: {
    marginTop: "16px",
    padding: "12px 24px",
    fontSize: "1rem",
    backgroundColor: "#e53e3e",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
