const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const roomSchema = new Schema({
  roomId: String,
  roomName: String,
  roomTag: [String],
  roomType: {
    type: String,
    enum: {
      values: ['person', 'group', 'message'],
      message: '{VALUE} is not supported',
    },
  },
  roomAvatarUrl: String,
  roomDesc: String,
  pwd: String,
  tableName: {
    type: String,
    enum: {
      values: [
        'messages_1',
        'messages_2',
        'messages_3',
        'messages_4',
        'messages_5',
      ],
      message: 'table name {VALUE} is not supported',
    },
  },
  private: Boolean,
  allowSetting: Boolean,
  updateTime: { type: Date, default: Date.now },
  ownerId: String,
  limitLen: Number,
  userIds: [
    {
      userId: String,
      state: {
        type: String,
        enum: {
          values: ['onLine', 'offLine'],
          message: 'userid state {VALUE} is not supported',
        },
      },
    },
  ],
  // 点对点房间远端用户id，群组房间不需要填写
  receiveId: String,
  // 最后一条消息id
  lastMsgId: String,
  // 最后一位消息用户id
  lastUserId: String,
  // 是否固定
  isFixed: Boolean,
});

const UserState = {
  onLine: 'onLine',
  offLine: 'offLine',
};

const roomModel = model('rooms', roomSchema);

module.exports = {
  roomModel,
  UserState,
};
