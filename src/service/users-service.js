const { v4: uuidv4 } = require("uuid");
const DB = require("../utils/db");
const { CardStatus } = require("../utils/constants");

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
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, name, email, sub, createdAt]
    );

    return result.rows[0].id;
  } catch (error) {
    console.log("Error inserting user.", error);
    throw error;
  }
};

const getUsers = async () => {
  try {
    const result = await DB.query("SELECT * FROM users");
    return result.rows;
  } catch (error) {
    console.log("Error fetching users.", error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const result = await DB.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.log("Error fetching user.", error);
    throw error;
  }
};

const getUserBySub = async (sub) => {
  try {
    const result = await DB.query("SELECT * FROM users WHERE sub = $1", [sub]);
    if (result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.log("Error fetching user.", error);
    throw error;
  }
};

const getUserCards = async (userId) => {
  try {
    const result = await DB.query(`SELECT * FROM cards WHERE cards."userId" = $1 ORDER BY "updatedAt" DESC`, [userId]);
    return result.rows;
  } catch (error) {
    console.log("Error fetching users pokemon cards.", error);
    throw error;
  }
};

const createUserCard = async (userId, data) => {
  try {
    const id = uuidv4();
    const date = new Date().toString();
    const createdAt = date.slice(0, 24);
    const { name, picture, condition, price, types, series, apiId } = data;
    const status = CardStatus.AVAILABLE;

    await DB.query(
      `INSERT INTO cards (id, name, picture, condition, price, types, series, status, "apiId", "createdAt", "userId")  
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, name, picture, condition, price, types, series, status, apiId, createdAt, userId]
    );
  } catch (error) {
    console.log("Error inserting user.", error);
    throw error;
  }
};

const updateUserCard = async (price, condition, status, cardId, userId) => {
  try {
    const updatedAt = new Date().toString().slice(0, 24);
    const result = await DB.query(`UPDATE cards SET condition = COALESCE($1, condition),
     price = COALESCE($2, price), status = COALESCE($3, status), "updatedAt" = $4 
     WHERE cards."id" = $5 AND cards."userId" = $6
     RETURNING *`,
      [condition, price, status, updatedAt, cardId, userId]);
    return result.rows[0];
  } catch (error) {
    console.log('Error updating card.', error);
  }
};

const deleteUserCard = async (cardId, userId) => {
  try {
    const result = await DB.query(`DELETE FROM cards WHERE cards."id" = $1 AND cards."userId" = $2`, [cardId, userId]);
    return result.rows;
  } catch (error) {
    console.log('Error deleting pokemon card.', error);
    throw error;
  }
}

module.exports = { createUser, getUsers, getUserById, getUserCards, createUserCard, deleteUserCard, updateUserCard, getUserBySub };
