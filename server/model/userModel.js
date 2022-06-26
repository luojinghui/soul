const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const UserModelSchema = new Schema({
  name: String,
  avatar: String,
  avatarType: {
    type: String,
    enum: {
      // 校验规则
      values: ['Local', 'Remote'],
      message: '{VALUE} is not supported',
    },
  },
  sex: {
    type: String,
    enum: {
      // 校验规则
      values: ['boy', 'girl', ''],
      message: '{VALUE} is not supported',
    },
  },
  age: String,
  address: String,
  phone: String,
  pwd: String,
  tag: Array,
  agent: String,
  platform: String,
  createTime: { type: Date, default: Date.now },
});

const userModel = model('users', UserModelSchema);

module.exports = {
  userModel,
};
