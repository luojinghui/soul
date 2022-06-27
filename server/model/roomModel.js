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
  roomDesc: String,
  pwd: String,
  tableName: {
    type: String,
    enum: {
      values: ['messages_1', 'messages_2'],
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
  receiveId: String,
  lastMsgId: String,
  lastUserId: String,
});

const UserState = {
  onLine: 'onLine',
  offLine: 'offLine',
};

const roomModel = model('rooms', roomSchema);

module.exports = {
  roomModel,
  UserState
};
