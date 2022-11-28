const DB = require("../utils/db");

const createChatRoom = async (userId1, userId2) => {
  const result = await DB.query(
    `INSERT INTO chat_rooms ("userId1", "userId2")  
          VALUES ($1, $2) RETURNING id`,
    [userId1, userId2]
  );

  return result.rows[0];
};

const getChatRooms = async (userId) => {
  const result = await DB.query(
    `SELECT u1.id as "userId1", u1.name as "userName1", u2.id as "userId2", u2.name as "userName2", chat_rooms.id as "chatRoomId" FROM chat_rooms
     INNER JOIN users u1 ON u1.id = chat_rooms."userId1"
     INNER JOIN users u2 ON u2.id = chat_rooms."userId2"
     WHERE "userId1" = $1 OR "userId2" = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return [];
  }

  return result.rows.map((room) => {
    if (room.userId1 !== userId) {
      return {
        id: room.chatRoomId,
        userId: room.userId1,
        userName: room.userName1,
      };
    }

    return {
      id: room.chatRoomId,
      userId: room.userId2,
      userName: room.userName2,
    };
  });
};

const getChatRoom = async (userId1, userId2) => {
  const result = await DB.query(
    `SELECT * FROM chat_rooms WHERE ("userId1" = $1 AND "userId2" = $2) OR ("userId2" = $1 AND "userId1" = $2) LIMIT 1`,
    [userId1, userId2]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

module.exports = {
  getChatRooms,
  getChatRoom,
  createChatRoom,
};
