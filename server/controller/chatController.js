const { userModel } = require('../model/userModel');
const { roomModel } = require('../model/roomModel');
const { message2Model, messageModel } = require('../model/messageModel');

const cacheUserMap = {};
const messageModelMap = {
  messages_1: messageModel,
  messages_2: message2Model,
};
const MessageTableByRoomId = {};
let ioInstance = null;

const onSocket = (socket, io) => {
  ioInstance = io;
  console.log('im socket connected');

  socket.on('message', (msg) => {
    const type = msg.type;

    console.log('receive msg: ', msg);
    switch (type) {
      case 'join':
        onJoinroom(socket, msg);
        break;
      case 'chat':
        onReceiveChatMessage(msg);
        break;
    }
  });

  socket.on('disconnect', () => {
    console.log('disconnected socket', socket.info);

    leaveRoom(socket.info);
  });
};

/**
 * 用户离线，清理room房间中的资源
 *
 * @param {userId: string, roomId: string } param socket缓存信息
 */
const leaveRoom = async ({ userId, roomId }) => {
  try {
    const query = await roomModel.findOne({ roomId }).exec();

    const { userIds = [] } = query;
    const index = userIds.indexOf(userId);

    if (index > -1) {
      userIds.splice(index, 1);
      await roomModel.updateOne({ roomId }, { userIds });

      console.log('delete user: ', userId);
    }
  } catch (err) {
    console.log('leaveRoom update err: ', err);
  }
};

const onReceiveChatMessage = async (msg) => {
  try {
    const { data, roomId, userId } = msg;
    const msgModel = await getMessageModel(roomId);
    const chat = await msgModel.create(data);

    sendMessage(
      {
        type: 'message',
        data: chat,
      },
      roomId
    );
  } catch (err) {
    console.log('save chat message error: ', err);
  }
};

const onJoinroom = async (socket, msg) => {
  const { roomId, userId } = msg;

  // 将userId和socket实例缓存起来，用户向当前用户推送消息
  cacheUserMap[userId] = socket;
  // 设置当前socket实例绑定的信息，后续可以在退会中获取是哪个用户离线
  socket.info = {
    userId,
    roomId,
  };
  // 当前socket实例加入到room房间中
  socket.join(roomId);

  try {
    const query = await roomModel.findOne({ roomId }).exec();
    const { userIds = [], tableName = 'messages_1' } = query;
    const isExist = userIds.includes(userId);

    if (!isExist) {
      userIds.push(userId);
      const update = await roomModel.updateOne({ roomId }, { userIds });

      console.log('update: ', update);
    }

    console.log('userIds: ', userIds);

    MessageTableByRoomId[roomId] = tableName;
    const userMap = {};
    const userIdLen = userIds.length;

    for (let i = 0; i < userIdLen; i++) {
      const id = userIds[i];
      const user = await userModel.findById(id).exec();

      if (user) {
        const { id, name, avatar, avatarType, sex, age, tag } = user;
        userMap[id] = {
          id,
          name,
          avatar,
          avatarType,
          sex,
          age,
          tag,
        };
      }
    }

    const sendData = {
      type: 'users',
      data: userMap,
      msg: 'chat users info',
    };
    sendMessage(sendData, roomId, '');

    // const msgModel = messageModelMap[tableName];

    // TODO: 此处需要从数据库中获取前200条数据，用于历史数据的展示
    const msgList = [];
    const historyData = {
      type: 'message_list',
      data: msgList,
      msg: 'All msg list',
    };

    sendMessage(historyData, '', socket);
  } catch (err) {
    console.log('join room error: ', err);
  }
};

/**
 * 通过roomId获取存储的messageModel
 *
 * @param {string} roomId 房间id
 */
const getMessageModel = async (roomId) => {
  let tableName = MessageTableByRoomId[roomId];

  if (!tableName) {
    const query = await roomModel.findById(roomId).exec();

    tableName = query.tableName;
  }

  return messageModelMap[tableName];
};

/**
 * 用于向当前用户或者当前房间所有用户推送消息
 *
 * @param {Object} data 推送的对象数据
 * @param {String} roomId 房间id，用于向当前房间内所有用户推送消息，默认是空
 * @param {Socket} socket 当前用户Socket实例，如果填写，则代表仅向当前用户推送消息
 */
const sendMessage = (data, roomId = '', socket = '') => {
  const socketInstance = roomId ? ioInstance.to(roomId) : socket;

  console.log('send msg: ', data);
  socketInstance.emit('message', data);
};

module.exports = {
  onSocket,
};
