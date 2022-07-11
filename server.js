/**
 * Soul Server Entry
 *
 * @summary app.js
 * @email luojinghui424@gmail.com
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:22:59
 * Last modified  : 2022-07-11 21:04:13
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
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: true, path: '/im' });

app
  .use(crossConfig)
  .use(compression())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(express.static(path.join(__dirname, 'build')))
  .use(express.static(path.join(__dirname, 'static')));

// wss服务
io.on('connection', (socket) => {
  chatController.onSocket(socket, io);
});

app.use(
  '/third1',
  createProxyMiddleware({
    target: 'http://p1-bos.532106.com/',
    changeOrigin: true,
    headers: {
      Accept: '*/*',
      'User-Agent': 'request',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
      host: 'http://p1-bos.532106.com',
    },
    hostRewrite: true,
    pathRewrite: { '^/third1': '/' },
  })
);

// rest服务
app.use(router);

server.listen(port, () => {
  console.log('current env: ', process.env.NODE_ENV);
  console.log('listening on: ', port);
});
