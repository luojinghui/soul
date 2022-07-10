const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const messageSchema = new Schema({
  roomId: String,
  userId: String,
  msgType: {
    type: String,
    enum: {
      values: ['text', 'file', 'super_emoji'],
      message: '{VALUE} is not supported',
    },
  },
  content: String,
  fileUrl: String,
  fileName: String,
  originalName: String,
  mimeType: String,
  size: Number,
  status: {
    type: String,
    enum: {
      values: ['success', 'fail', 'pending', 'retract'],
      message: 'msg status {VALUE} is not supported',
      default: 'success',
    },
  },
  createTime: { type: Date, default: Date.now },
});

const messageModel = model('messages_1', messageSchema);
const message2Model = model('messages_2', messageSchema);
const message3Model = model('messages_3', messageSchema);
const message4Model = model('messages_4', messageSchema);
const message5Model = model('messages_5', messageSchema);

module.exports = {
  messageModel,
  message2Model,
  message3Model,
  message4Model,
  message5Model,
};
