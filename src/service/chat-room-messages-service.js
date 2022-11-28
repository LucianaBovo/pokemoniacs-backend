const DB = require("../utils/db");

const createMessage = async (roomId, userId, message) => {
  const result = await DB.query(
    `INSERT INTO chat_room_messages ("chatRoomId", "userId", "message")  
          VALUES ($1, $2, $3) RETURNING id`,
    [roomId, userId, message]
  );

  return result.rows[0];
};

const getMessagesForRoom = async (roomId) => {
  const result = await DB.query(
    `SELECT *, users.name as "userName"
    FROM chat_room_messages 
    INNER JOIN users ON users.id = chat_room_messages."userId"
    WHERE "chatRoomId" = $1 ORDER BY chat_room_messages."createdAt"`,
    [roomId]
  );

  if (result.rows.length === 0) {
    return [];
  }

  return result.rows;
};

module.exports = {
  createMessage,
  getMessagesForRoom,
};
