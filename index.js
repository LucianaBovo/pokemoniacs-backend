const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const UsersService = require('./src/service/users-service');
const CardsService = require('./src/service/cards-service');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/users', async (req, res) => {
  try {
    const result = await UsersService.getUsers();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching users.'});
  } 
});

app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await UsersService.getUserById(userId);
    if (!result) {
      return res.status(404).json({ error: `Could not find user with id ${userId}.` });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching user.'});
  }
});

app.get('/users/:id/cards', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await UsersService.getUserCards(userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching user cards.'});
  }
});

app.post('/users', async (req, res) => {
  try {
    const data = req.body;
    const { name, email, sub } = data;
    if (!name || !email || !sub) {
      return res.status(400).send({ error: 'Invalid input.' });
    }

    const userId = await UsersService.createUser(data);
    return res.json({ success: true, userId });
  } catch (error) {
    return res.status(500).json({ error: 'Error creating user.'});
  }
});

app.get('/cards/available', async (req, res) => {
  try {
    const result = await CardsService.getAvailableCards();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching available cards.'});
  }
});

app.get('/cards/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    const result = await CardsService.getCardById(cardId);
    if (!result) {
      return res.status(404).json({ error: `Could not find card with id ${cardId}.` });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching card.'});
  }
});

app.post('/users/:userId/cards', async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;
    const { name, picture, condition, price } = data;
    if (!name || !picture || !condition || !price) {
      return res.status(400).send({ error: 'Invalid input.' });
    }

    await UsersService.createUserCard(userId, data);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Error creating card for user.'});
  }
});


app.listen(3001, () => {
  console.log('app listening on port 3001');
});
