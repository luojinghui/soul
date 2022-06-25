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

const onSocket = (socket, io) => {
  ioInstance = io;
  console.log('im socket connected');

  socket.on('message', (msg) => {
    console.log('receive msg: ', msg);

    const type = msg.type;

    switch (type) {
      case 'connected':
        break;
      case 'join':
        onJoinMeeting(socket, msg);
        break;
      case 'chat':
        onReceiveChatMessage(msg);
        break;
    }
  });

  socket.on('disconnect', (e) => {
    console.log('user disconnected', socket.info);
  });
};

const onReceiveChatMessage = (msg) => {
  const { data, meetingId } = msg;
  const currentMeetingInfo = meetingMap[meetingId];

  console.log('data: ', data);

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
};

const onJoinMeeting = (socket, msg) => {
  const { meetingId, userId } = msg;

  userMap[userId] = socket;
  socket.info = {
    userId,
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
};

/**
 * 发送消息，分为向当前用户发送、向房间内所有用户发送
 */
const sendMessage = (data, meetingId, socket) => {
  const socketInstance = meetingId ? ioInstance.to(meetingId) : socket;

  console.log('send msg: ', data);
  socketInstance.emit('message', data);
};

module.exports = {
  onSocket,
};
