import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
const PORT = 3300;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get("/", (req, res) => {
  res.send("hello, world");
//  res.sendFile(path.join(__dirname, "/index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

const rooms = {};
const socketToRoom = {};

const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    const roomId = data.room;
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;

    if (rooms[roomId]) {
      rooms[roomId].push({ id: socket.id, name: data.name });
    } else {
      rooms[roomId] = [{ id: socket.id, name: data.name }];
    }

    const users = rooms[data.room].filter((user) => user.id !== socket.id);

    io.sockets.to(socket.id).emit("room_users", users);

    console.log("[joined] room:" + data.room + " name: " + data.name);
  });

  socket.on("offer", (sdp) => {
    socket.broadcast.emit("getOffer", sdp);
    console.log("offer: " + socket.id);
  });

  socket.on("answer", (sdp) => {
    socket.broadcast.emit("getAnswer", sdp);
    console.log("answer: " + socket.id);
  });

  socket.on("candidate", (sdp) => {
    socket.broadcast.emit("getCandidate", sdp);
    console.log("candidate: " + socket.id);
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];
    let room = rooms[roomId];
    if (room) {
      room = room.filter((user) => user.id !== socket.id);
      rooms[roomId] = room;
    }

    socket.broadcast.to(room).emit("user_exit", { id: socket.id });
    console.log(`[$SocketToRoom[socket.id]]: ${socket.id} exit`);
  });
});
