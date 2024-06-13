import { io } from "socket.io-client";

const socket = io("http://localhost:3300", {
  transports: ["websocket", "polling", "flashsocket"],
  cors: {
    origin: "http://localhost:3300",
    credentials: true,
  },
  withCredentials: true,
});

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const peerConnection = new RTCPeerConnection(pc_config);

socket.on("connect", () => {
  console.log("Hello, successfully connected to the signaling server!");
});

socket.on("room_users", (data) => {
  console.log("join:" + data);
});
