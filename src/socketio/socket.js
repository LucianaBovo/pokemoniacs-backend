// should be first, else process.env is empty
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { verifyJwtCheck, getUser } = require("../utils/auth");

const attachSocketIO = (app) => {
  const connectedSockets = {};
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.accessToken) {
      try {
        const { sub } = await verifyJwtCheck(
          socket.handshake.query.accessToken
        );

        socket.user = await getUser(sub);

        return next();
      } catch (error) {
        return next(new Error("Authentication Failed"));
      }
    }

    next(new Error("Authentication Failed"));
  });

  io.on("connection", (socket) => {
    const userIdentifier = `${socket.id}/${socket.user.user_id}`;
    console.log(`User connected: ${userIdentifier}`);

    if (!connectedSockets[socket.user.user_id])
      connectedSockets[socket.user.user_id] = [];

    connectedSockets[socket.user.user_id].push(socket);

    socket.on("join_direct_message", (userId) => {
      console.log(`${userIdentifier} has join direct_message: ${userId}`);

      socket.join(`${socket.user.user_id}:${userId}`);
    });

    socket.on("send_message", async (data) => {
      const toUser = await getUser(data.toUser);

      console.log(
        `Received message from ${userIdentifier} at user: ${data.toUser} and message: ${data.message}`
      );

      socket.emit("receive_message", {
        toUser: {
          id: toUser.user_id,
          picture: toUser.picture,
          name: toUser.name,
        },
        fromUser: {
          id: socket.user.user_id,
          picture: socket.user.picture,
          name: socket.user.name,
        },
        message: data.message,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `User disconnected: ${socket.id} with id: ${socket.user.user_id} and reason: ${reason}`
      );

      connectedSockets[socket.user.user_id] = (
        connectedSockets[socket.user.user_id] ?? []
      ).filter((s) => socket.id !== s.id);
    });
  });

  io.on("disconnect", (socket) => {});

  return server;
};

module.exports = {
  attachSocketIO,
};
