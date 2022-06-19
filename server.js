/**
 * SDK Node Server Entry
 *
 * @summary app.js
 * @email luojinghui424@gmail.com
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:22:59
 * Last modified  : 2022-06-18 01:38:18
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const routing = require('./server/routes/router.js');
const { port } = require('./server/config/index');
const { Server } = require('socket.io');
const { createServer } = require('http');
const onIMSocket = require('./server/controller/imSocket');

const app = express();

const server = createServer(app);
const io = new Server(server, { cors: true, path: '/im' });

io.on('connection', (socket) => {
  onIMSocket(socket, io);
});

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
};

app.use(allowCrossDomain);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routing);

server.listen(port, () => {
  console.log('current env: ', process.env.NODE_ENV);
  console.log('listening on: ', port);
});
