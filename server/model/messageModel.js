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
      values: ['text', 'image', 'file'],
      message: '{VALUE} is not supported',
    },
  },
  content: String,
  imageUrl: String,
  fileUrl: String,
  fileJson: String,
  seq: { type: Number, default: 0 },
  createTime: { type: Date, default: Date.now },
});

const messageModel = model('messages_1', messageSchema);
const message2Model = model('messages_2', messageSchema);

module.exports = {
  messageModel,
  message2Model,
};
