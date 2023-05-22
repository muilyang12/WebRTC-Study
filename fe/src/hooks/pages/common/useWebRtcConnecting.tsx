import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface UseWebRtcConnectingParams {
  roomName?: string;
}

export default function useWebRtcConnecting(props: UseWebRtcConnectingParams) {
  const { roomName } = props;

  const [socket, setSocket] = useState<Socket>();
  const [rtcConnection, setRtcConnection] = useState<RTCPeerConnection>();

  useEffect(() => {
    if (!roomName) return;
    if (!process.env.API_BASE_URI) throw new Error("Invalid server URI");

    const socket = io(process.env.API_BASE_URI);
    const rtcConnection = new RTCPeerConnection();

    socket.on("someone_joined", async () => {
      console.log("Someone joined. :)");

      const offer = await rtcConnection.createOffer();
      rtcConnection.setLocalDescription(offer);
      socket.emit("send_offer", offer, roomName);
      console.log("send_offer");
    });

    socket.on("receive_offer", async (offer: RTCSessionDescriptionInit) => {
      console.log("receive_offer");
      rtcConnection.setRemoteDescription(offer);

      const answer = await rtcConnection.createAnswer();
      rtcConnection.setLocalDescription(answer);

      socket.emit("send_answer", answer, roomName);
      console.log("send_answer");
    });

    socket.on("receive_answer", (answer: RTCSessionDescriptionInit) => {
      console.log("receive_answer");
      rtcConnection.setRemoteDescription(answer);
    });

    rtcConnection.addEventListener("icecandidate", (data: RTCPeerConnectionIceEvent) => {
      socket.emit("send_candidate", data.candidate, roomName);
      console.log("send_candidate");
    });

    socket.on("receive_candidate", (candidate: RTCIceCandidate) => {
      console.log("receive_candidate");
      rtcConnection.addIceCandidate(candidate);
    });

    setRtcConnection(rtcConnection);
    setSocket(socket);
  }, [roomName]);

  return {
    socket,
    rtcConnection,
  };
}
