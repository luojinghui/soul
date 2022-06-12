/**
 * long description for the file
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-07 16:48:07
 * Last modified  : 2022-06-13 01:01:26
 */

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const isDev = process.env.NODE_ENV === 'development';

const DBHOST = 'mongodb://root:xxx@127.0.0.1:27017/sdk_doc?authSource=admin';

const FeedbackModelSchema = new Schema({
  url: String,
  comment: String,
  contact: String,
  mark: Number,
  createTime: { type: Date, default: Date.now },
  note: String,
});

const FeedbackModel = model(
  'FeedbackModel',
  FeedbackModelSchema,
  isDev ? 'feedback_dev' : 'feedback_prd'
);

const connectDB = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(DBHOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // user是数据库名称
    mongoose.connection.on('connected', function () {
      console.log('MongoDB connected.');

      resolve(true);
    });

    mongoose.connection.on('error', function () {
      console.log('MongoDB failed.');

      reject(false);
    });

    mongoose.connection.on('disconnected', function (e) {
      console.log('MongoDB connected disconnected.', e);

      reject(false);
    });
  });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  FeedbackModel,
  connectDB,
  disconnectDB,
};
