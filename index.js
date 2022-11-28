const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { attachSocketIO } = require("./src/socketio/socket.js");
const UsersService = require("./src/service/users-service");
const CardsService = require("./src/service/cards-service");
const ChatRoomsService = require("./src/service/chat-rooms-service");
const ChatRoomMessageService = require("./src/service/chat-room-messages-service");
const { jwtCheck, getUsers, getUser } = require("./src/utils/auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  return res.json({ success: true });
});

app.get("/users", async (req, res) => {
  try {
    const result = await UsersService.getUsers();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching users." });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await UsersService.getUserById(userId);
    if (!result) {
      return res
        .status(404)
        .json({ error: `Could not find user with id ${userId}.` });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user." });
  }
});

app.get("/users/:id/cards", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await UsersService.getUserCards(userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user cards." });
  }
});

app.put("/users/:userId/cards/:cardId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const cardId = req.params.cardId;
    const { price, condition, status } = req.body;
    if (!userId || !cardId) {
      return res.status(400).send({ error: "Invalid input." });
    }
    const card = await CardsService.getCardById(cardId);
    if (card.userId !== userId) {
      return res
        .status(400).send({ error: "Card does not belong to user." });
    }

    const updatedCard = await UsersService.updateUserCard(price, condition, status, cardId, userId);
    return res.status(200).json({ success: true, updatedCard });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user cards." });
  }
});

app.delete("/users/:userId/cards/:cardId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const cardId = req.params.cardId;
    if (!userId || !cardId) {
      return res.status(400).send({ error: "Invalid input." });
    }

    const card = await CardsService.getCardById(cardId);
    if (card.userId !== userId) {
      return res
        .status(400).send({ error: "Card does not belong to user." });
    }

    await UsersService.deleteUserCard(cardId, userId);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching user cards." });
  }
});

app.post("/users", async (req, res) => {
  try {
    const data = req.body;
    const { name, email, sub } = data;
    if (!name || !email || !sub) {
      return res.status(400).send({ error: "Invalid input." });
    }

    const userId = await UsersService.createUser(data);
    return res.json({ success: true, userId });
  } catch (error) {
    return res.status(500).json({ error: "Error creating user." });
  }
});

app.get("/auth0/users", jwtCheck, async (req, res) => {
  const users = await getUsers(req.query.searchTerm);

  return res.status(200).json(
    users.map((user) => {
      return {
        name: user.name,
        picture: user.picture,
        userId: user.user_id,
      };
    })
  );
});

app.get("/auth0/users/:userId", jwtCheck, async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({
      message: "Please provide a userId",
    });
  }

  const user = await getUser(userId);

  return res.status(200).json({
    name: user.name,
    picture: user.picture,
    userId: user.user_id,
  });
});

app.get("/cards/available", async (req, res) => {
  try {
    const result = await CardsService.getAvailableCards();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching available cards." });
  }
});

app.get("/cards/:id", async (req, res) => {
  try {
    const cardId = req.params.id;
    const result = await CardsService.getCardById(cardId);
    if (!result) {
      return res
        .status(404)
        .json({ error: `Could not find card with id ${cardId}.` });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching card." });
  }
});

app.post("/users/:userId/cards", async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;
    const { name, picture, condition, price } = data;
    if (!name || !picture || !condition || !price) {
      return res.status(400).send({ error: "Invalid input." });
    }

    await UsersService.createUserCard(userId, data);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error creating card for user." });
  }
});

app.use("/chat-rooms", jwtCheck, async (req, res) => {
  const user = await UsersService.getUserBySub(req.auth.sub);
  const rooms = await ChatRoomsService.getChatRooms(user.id);

  return res.status(200).json(rooms);
});

app.use("/messages/:userId", jwtCheck, async (req, res) => {
  const user = await UsersService.getUserBySub(req.auth.sub);
  const room = await ChatRoomsService.getChatRoom(user.id, req.params.userId);

  if (!room) {
    return res.status(200).json([]);
  }

  const messages = await ChatRoomMessageService.getMessagesForRoom(room.id);

  return res.status(200).json(
    messages.map((message) => {
      return {
        message: message.message,
        userName: message.userName,
      };
    })
  );
});

attachSocketIO(app).listen(process.env.PORT || 3001, () => {
  console.log("app listening on port 3001");
});


