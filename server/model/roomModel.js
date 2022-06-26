const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const roomSchema = new Schema({
  roomId: String,
  roomName: String,
  roomTag: Array,
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
  userIds: Array,
  receiveId: String,
  lastMsgId: String,
  lastUserId: String,
});

const roomModel = model('rooms', roomSchema);

module.exports = {
  roomModel,
};
