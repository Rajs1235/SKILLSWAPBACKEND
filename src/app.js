import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/user.routes.js";
import matchRoutes from "./routes/match.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import matchListingRoutes from "./routes/matchListing.routes.js";
import ChatMessage from "./models/message.model.js";
import connectionRoutes from './routes/connection.routes.js';


const app = express();

// ✅ Mount routers with prefixes

 // <-- this line is crucial

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.netlify.app'], // replace with your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use('/api/v1/users', userRoutes);
app.get("/", (req, res) => {
  res.send("✅ SkillSwap Backend is running");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/matchlistings", matchListingRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/match", matchRoutes);
app.use('/api/v1/connections', connectionRoutes);
// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO logic
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
    console.log(`You have a new match with ${from}`);
  });

  socket.on("send_message", async (msg) => {
    const { roomId, senderId, text, senderName } = msg;

    try {
      const saved = await ChatMessage.create({
        conversation: roomId,
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

// Export
export { app, server };
