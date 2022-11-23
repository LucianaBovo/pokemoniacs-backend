const { v4: uuidv4 } = require('uuid');
const DB = require('../utils/db');
const { CardStatus } = require('../utils/constants');

const createUser = async (data) => {
  try {
    const user = await getUserBySub(data.sub);
    if (user) {
      return user.id;
    }
  
    const id = uuidv4();
    const date = new Date().toString();
    const createdAt = date.slice(0, 24);
    const { name, email, sub } = data;

    const result = await DB.query(
      `INSERT INTO users (id, name, email, sub, "createdAt")  
        VALUES ($1, $2, $3, $4, $5) RETURNING id`, [id, name, email, sub, createdAt]);

    return result.rows[0].id;
  } catch (error) {
    console.log('Error inserting user.', error);
    throw error;
  }
};

const getUsers = async () => {
  try {
    const result = await DB.query('SELECT * FROM users');
    return result.rows;
  } catch (error) {
    console.log('Error fetching users.', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const result = await DB.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.log('Error fetching user.', error);
    throw error;
  }
};
const getUserBySub = async (sub) => {
  try {
    const result = await DB.query('SELECT * FROM users WHERE sub = $1', [sub]);
    if (result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.log('Error fetching user.', error);
    throw error;
  }
};

const getUserCards = async (userId) => {
  try {
    const result = await DB.query(`SELECT * FROM cards WHERE cards."userId" = $1`, [userId]);
    return result.rows;
  } catch (error) {
    console.log('Error fetching users pokemon cards.', error);
    throw error;
  }
};

const createUserCard = async (userId, data) => {
  try {
    const id = uuidv4();
    const date = new Date().toString();
    const createdAt = date.slice(0, 24);
    const { name, picture, condition, price } = data;
    const status = CardStatus.AVAILABLE;
  
    await DB.query(
      `INSERT INTO cards (id, name, picture, condition, price, status, "createdAt", "userId")  
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, name, picture, condition, price, status, createdAt, userId]);

  } catch (error) {
    console.log('Error inserting user.', error);
    throw error;
  }
};

module.exports = { createUser, getUsers, getUserById, getUserCards, createUserCard };
