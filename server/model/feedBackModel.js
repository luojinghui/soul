const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const FeedbackModelSchema = new Schema({
  url: String,
  comment: String,
  contact: String,
  mark: Number,
  createTime: { type: Date, default: Date.now },
  note: String,
});

const FeedbackModel = model('feed_backs', FeedbackModelSchema);

module.exports = {
  FeedbackModel,
};
