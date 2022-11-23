const { v4: uuidv4 } = require('uuid');
const DB = require('../utils/db');
const { CardStatus } = require('../utils/constants');

const getAvailableCards = async () => {
  try {
    const result = await DB.query('SELECT * FROM cards WHERE status = $1', [CardStatus.AVAILABLE]);
    return result.rows;
  } catch (error) {
    console.log('Error fetching available cards.', error);
    throw error;
  }
};

const getCardById = async (cardId) => {
  try {
    const result = await DB.query('SELECT * FROM cards WHERE id = $1', [cardId]);
    if (result.rows.length === 0) {
      return undefined;
    }

    return result.rows[0];
  } catch (error) {
    console.log('Error fetching card.', error);
    throw error;
  }
};

module.exports = { getAvailableCards, getCardById };
