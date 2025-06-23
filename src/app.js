import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from './routes/user.routes.js'
import dropIndexRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import http from 'http';
import { Server } from 'socket.io';
import ChatMessage from './models/message.model.js'; // or chatmessage.model.js depending on your filename


const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use('/v1/chat', chatRoutes);
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use('/admin', dropIndexRoutes); // or however your app structure is
//routes

const matchRoutes = require('./routes/match.routes');
app.use('/v1/match', matchRoutes);

//route declaration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend domain
    methods: ["GET", "POST"]
  }
});
io.on('connection', (socket) => {
  console.log('🔌 A user connected');

  // Join Room
  socket.on('join_room', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Leave Room
  socket.on('leave_room', ({ roomId, userId }) => {
    socket.leave(roomId);
    console.log(`User ${userId} left room ${roomId}`);
  });

  // Send Message
  socket.on('send_message', async (msg) => {
    const { roomId, senderId, text, timestamp, senderName } = msg;

    try {
      const saved = await ChatMessage.create({ roomId, sender: senderId, text, timestamp });
      io.to(roomId).emit('receive_message', {
        ...saved.toObject(),
        senderName // this can be passed from frontend
      });
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

app.use("/api/v1/users",router)
export {app}