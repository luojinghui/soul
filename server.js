/**
 * Soul Server Entry
 *
 * @summary app.js
 * @email luojinghui424@gmail.com
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:22:59
 * Last modified  : 2022-06-26 10:50:36
 */

const express = require('express');
const path = require('path');
const router = require('./server/router.js');
const compression = require('compression');
const chatController = require('./server/controller/chatController');
const { createServer } = require('http');
const { crossConfig } = require('./server/middleware/cros');
const { port } = require('./server/config/index');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: true, path: '/im' });

app
  .use(crossConfig)
  .use(compression())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(express.static(path.join(__dirname, 'build')));

// wss服务
io.on('connection', (socket) => {
  chatController.onSocket(socket, io);
});
// rest服务
app.use(router);

server.listen(port, () => {
  console.log('current env: ', process.env.NODE_ENV);
  console.log('listening on: ', port);
});
