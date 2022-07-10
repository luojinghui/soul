/**
 * Chat Room Controller
 */

const { userModel } = require('../model/userModel');
const { roomModel, UserState } = require('../model/roomModel');
const {
  message2Model,
  messageModel,
  message3Model,
  message4Model,
  message5Model,
} = require('../model/messageModel');

const cacheUserMap = {};
const messageModelMap = {
  messages_1: messageModel,
  messages_2: message2Model,
  messages_3: message3Model,
  messages_4: message4Model,
  messages_5: message5Model,
};
const MessageTableByRoomId = {};
let ioInstance = null;

/**
 * 处理Socket连接
 *
 * @param {Socket} socket socket实例
 * @param {IO} io io实例
 */
const onSocket = (socket, io) => {
  ioInstance = io;
  console.log('im socket connected');

  socket.on('message', (msg) => {
    const type = msg.type;

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
    const roomQuery = await roomModel.findOne({ roomId }).exec();

    const { userIds = [] } = roomQuery;
    const userIdIndex = userIds.findIndex((item) => item.userId === userId);

    if (userIdIndex > -1) {
      userIds[userIdIndex].state = UserState.offLine;

      await roomModel.updateOne({ roomId }, { userIds });
    }
  } catch (err) {
    console.log('leaveRoom update err: ', err);
  }
};

/**
 * 处理接收到的聊天消息
 *
 * @param {Object} msg 消息内容
 */
const onReceiveChatMessage = async (msg) => {
  try {
    const { data, roomId, userId } = msg;
    const msgModel = await getMessageModel(roomId);
    // 设置消息状态
    const nextData = { ...data, status: 'success' };
    const chat = await msgModel.create(nextData);

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

/**
 * 新用户加入聊天室
 *
 * @param {Socket} socket socket实例
 * @param {Object} msg 消息内容
 */
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
    const userIdIndex = userIds.findIndex((item) => item.userId === userId);

    if (userIdIndex < 0) {
      userIds.push({
        userId,
        state: UserState.onLine,
      });
      const update = await roomModel.updateOne({ roomId }, { userIds });
    }

    MessageTableByRoomId[roomId] = tableName;
    const userMap = {};
    const userIdLen = userIds.length;

    for (let i = 0; i < userIdLen; i++) {
      const { userId } = userIds[i];
      const userQuery = await userModel.findById(userId).exec();

      if (userQuery) {
        const { id, name, avatar, avatarType, sex, age, tag } = userQuery;
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

    const msgModel = await getMessageModel(roomId);
    const msgCount = await msgModel.countDocuments({ roomId }).exec();
    const totalPage = Math.ceil(msgCount / 100);
    const pageMessageQuery = await msgModel
      .find({ roomId })
      .skip(0)
      .limit(100)
      .exec();

    const historyData = {
      type: 'message_list',
      data: { totalPage, currentPage: 1, list: pageMessageQuery },
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
    const query = await roomModel.findOne({ roomId }).exec();

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

  socketInstance.emit('message', data);
};

module.exports = {
  onSocket,
};
