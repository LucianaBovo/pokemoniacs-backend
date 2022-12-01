const { v4: uuidv4 } = require('uuid');
const DB = require('../utils/db');
const { CardStatus } = require('../utils/constants');

const getAvailableCards = async (searchTerm) => {
  try {
    let query = 'SELECT * FROM cards WHERE status = $1';
    const queryParams = [CardStatus.AVAILABLE];
    if (searchTerm) {
      const ilikeTerm = `%${searchTerm}%`;
      query += " AND (name ILIKE $2 OR series ILIKE $2 OR $3 = ANY(lower(types::text)::text[]))"; 
      queryParams.push(ilikeTerm);
      queryParams.push(searchTerm.toLowerCase());
    }

    const result = await DB.query(query, queryParams);
    return result.rows;
  } catch (error) {
    console.log('Error fetching available cards.', error);
    throw error;
  }
};

const getCardById = async (cardId) => {
  try {
    const result = await DB.query(`SELECT cards.*, users.name as "sellerName" FROM cards 
      LEFT JOIN users on cards."userId" = users.id WHERE cards.id = $1`, [cardId]);
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
