import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/user.routes.js";
import matchRoutes from "./routes/match.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import ChatMessage from "./models/message.model.js";
import matchListingRoutes from "./routes/MatchListing.routes.js";
const app = express();

app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));


app.use("/api/v1/matchlistings", matchListingRoutes);

// Mount routes
app.get("/", (req, res) => {
  res.send("✅ SkillSwap Backend is running");
});

app.use("/api/v1/users", userRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/match", matchRoutes);

// Setup HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("join_room", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on("leave_room", ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`User ${userId} left room ${roomId}`);
  });
socket.on("new_match", ({ from, chatRoomId, videoRoomId }) => {
  // Notify user of new match and optionally auto-connect
console.log(`You have a new match with ${from}`);
});

  socket.on("send_message", async (msg) => {
    const { roomId, senderId, text, senderName } = msg;

    try {
      const saved = await ChatMessage.create({
        conversation: roomId, // schema field name
        sender: senderId,
        content: text
      });

      io.to(roomId).emit("receive_message", {
        ...saved.toObject(),
        senderName
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });
});
export  {app,server};
