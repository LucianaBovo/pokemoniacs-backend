// should be first, else process.env is empty
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { verifyJwtCheck } = require("../utils/auth");

const attachSocketIO = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.accessToken) {
      try {
        const { sub } = await verifyJwtCheck(
          socket.handshake.query.accessToken
        );

        socket.sub = sub;

        return next();
      } catch (error) {
        return next(new Error("Authentication Failed"));
      }
    }

    next(new Error("Authentication Failed"));
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} with id: ${socket.sub}`);

    socket.on("join_room", (data) => {
      console.log(`${socket.id}/${socket.sub} has join room: ${data}`);

      socket.join(data);
    });

    socket.on("send_message", (data) => {
      console.log(
        `Received message from ${socket.id}/${socket.sub} at room: ${data.room} and message: ${data.message}`
      );
      socket.emit("receive_message", data);
    });
  });

  return server;
};

module.exports = {
  attachSocketIO,
};
