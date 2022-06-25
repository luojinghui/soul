/**
 * long description for the file
 *
 * @summary short description for the file
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-07 16:48:07
 * Last modified  : 2022-06-26 01:23:50
 */

const mongoose = require('mongoose');

const DBHOST = (tableName) =>
  `mongodb://admin:xxxoooyyy123!@127.0.0.1:27017/${tableName}?authSource=admin`;

/**
 * 连接数据库
 *
 * @param {string} tableName 表名
 * @returns
 */
const connectDB = (tableName) => {
  return new Promise((resolve, reject) => {
    mongoose.connect(DBHOST(tableName), {
      useNewUrlParser: true,
      authSource: 'admin',
      useUnifiedTopology: true,
    });

    // user是数据库名称
    mongoose.connection.once('connected', function () {
      console.log('MongoDB connected.');

      resolve(true);
    });

    mongoose.connection.once('error', function () {
      console.log('MongoDB failed.');

      reject(false);
    });

    mongoose.connection.once('disconnected', function (e) {
      console.log('MongoDB connected disconnected.', e);

      reject(false);
    });
  });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectDB,
  disconnectDB,
};
