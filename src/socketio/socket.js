// should be first, else process.env is empty
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const { createAdapter } = require("@socket.io/cluster-adapter");

const cors = require("cors");
const { verifyJwtCheck, getUser } = require("../utils/auth");
const UsersService = require("../service/users-service");
const ChatRoomService = require("../service/chat-rooms-service");
const ChatRoomMessageService = require("../service/chat-room-messages-service");
const { setupWorker } = require("@socket.io/sticky");

const users = {};

const attachSocketIO = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.accessToken) {
      try {
        const { sub } = await verifyJwtCheck(
          socket.handshake.query.accessToken
        );

        socket.user = await UsersService.getUserBySub(sub);

        (await ChatRoomService.getChatRooms(socket.user.id)).forEach(
          (chatRoom) => {
            console.log(`${socket.user.id} has join room: ${chatRoom.id}`);

            socket.join(chatRoom.id);
          }
        );

        return next();
      } catch (error) {
        return next(new Error("Authentication Failed"));
      }
    }

    next(new Error("Authentication Failed"));
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.on("send_message", async (data) => {
      if (!data.userId || !data.message) {
        console.log("No userId or message ");
        return;
      }

      let chatRoom = await ChatRoomService.getChatRoom(
        socket.user.id,
        data.userId
      );

      if (!chatRoom) {
        chatRoom = await ChatRoomService.createChatRoom(
          socket.user.id,
          data.userId
        );

        socket.join(chatRoom.id);
      }

      console.log(
        `Received message from ${socket.user.id} message: ${data.message} room: ${chatRoom.id}`
      );

      await ChatRoomMessageService.createMessage(
        chatRoom.id,
        socket.user.id,
        data.message
      );

      // Send to other user
      socket.to(chatRoom.id).emit("receive_message", {
        message: data.message,
        userName: socket.user.name,
      });

      // Send to self
      socket.emit("receive_message", {
        message: data.message,
        userName: socket.user.name,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `User disconnected: ${socket.id} with id: ${socket.user.user_id} and reason: ${reason}`
      );
    });
  });

  io.on("disconnect", (socket) => {
    console.log(
      `User disconnected: ${socket.id} with id: ${socket.user.user_id} and reason: ${reason}`
    );
  });

  return server;
};

module.exports = {
  attachSocketIO,
};
