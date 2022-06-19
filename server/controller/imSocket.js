const meetingMap = {};
const userMap = {};

// const meetingMap = {
//   xxx: {
//     list: [],
//     data: 'xxx',
//     pwd: 'xxx',
//   },
// };

// const userMap = {
//   xxx: {
//     socket,
//     id: 'xxx',
//   },
// };

let ioInstance = null;

const onIMSocket = (socket, io) => {
  ioInstance = io;
  console.log('im socket connected');

  socket.on('message', (msg) => {
    console.log('msg: ', msg);
    console.log('msg: ', typeof msg);
    const { type, data, meetingId, name } = JSON.parse(msg);

    switch (type) {
      case 'join':
        console.log('join user: ', name);

        userMap[name] = socket;
        socket.info = {
          name,
          meetingId,
        };
        socket.join(meetingId);

        const meetingInfo = meetingMap[meetingId];
        let msgList = [];

        if (meetingInfo) {
          msgList = meetingInfo.list;
        }

        const sendData = {
          type: 'history-msg',
          data: msgList,
          msg: 'All msg list',
        };
        sendMessage(sendData, '', socket);
        break;
      case 'chat':
        console.log('data: ', data);

        const currentMeetingInfo = meetingMap[meetingId];

        if (currentMeetingInfo) {
          currentMeetingInfo.list.push(data);
        } else {
          meetingMap[meetingId] = {
            list: [data],
            data: '',
            pwd: '',
          };
        }

        sendMessage(
          {
            type: 'remote-chat',
            data,
          },
          meetingId,
          ''
        );
        break;
    }
  });

  socket.on('disconnect', (e) => {
    console.log('user disconnected', socket.info);
  });
};

/**
 * 发送消息，分为向当前用户发送、向房间内所有用户发送
 */
const sendMessage = (data, meetingId, socket) => {
  const parseData = JSON.stringify(data);
  const socketInstance = meetingId ? ioInstance.to(meetingId) : socket;

  console.log('send msg: ', parseData);
  socketInstance.emit('message', parseData);
};

module.exports = onIMSocket;
