const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { connectDB } = require('./index');

connectDB();

const musicCommentSchema = new Schema({
  id: String,
  song: String,
  sing: String,
  album: String,
  cover: String,
  url: String,
  album: String,
  name: String,
  content: String,
  createTime: { type: Date, default: Date.now },
});

const musicCommentModel = model('music_comment', musicCommentSchema);

module.exports = { musicCommentModel };
