function startServer(options) {
  const express = require('express');
  const http = require('http');
  const zmq = require('zeromq');
  const socketIO = require('socket.io');
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server);

  const port = options.port || 3001;
  const subIP = options.subIP || 'tcp://127.0.0.1';
  const subPORT = options.subPORT || 5555;
  const pubIP = options.pubIP || 'tcp://127.0.0.1';
  const pubPORT = options.pubPORT || 5556;
  const pullIP = options.pullIP || 'tcp://127.0.0.1';
  const pullPORT = options.pullPORT || 5557;
  const pushIP = options.pushIP || 'tcp://127.0.0.1';
  const pushPORT = options.pushPORT || 5558;
  const reqIP = options.reqIP || 'tcp://127.0.0.1';
  const reqPORT = options.reqPORT || 5559;

  // Start the server
  server.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server started on port ${port}`);
  });

  /* ---------- PUB/SUB ---------- */

  // Connect to ZeroMQ and subscribe to a topic
  const subSock = zmq.socket('sub');
  subSock.connect(`${subIP}:${subPORT}`);
  subSock.subscribe('');
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server Subscriber connected on port ${subPORT}`
  );

  // Connect to ZeroMQ and publish to topic
  const pubSock = zmq.socket('pub');
  pubSock.bindSync(`${pubIP}:${pubPORT}`);
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server Publisher connected on port ${pubPORT}`
  );

  // Listen for incoming messages from ZeroMQ and emit them over Socket.io
  subSock.on('message', (data) => {
    io.emit('message', data.toString());
  });

  // Listen for messages from React Native SocketIO and send to Subscriber
  io.on('connection', (socket) => {
    socket.on('message', (message) => {
      console.log('message received', message);
      pubSock.send(['', message]);
    });
  });

  /* ---------- END of PUB/SUB ---------- */

  /* ---------- REQ/REP ---------- */

  // Connect to ZeroMQ - worker (Pull)
  const pullSock = zmq.socket('pull');
  pullSock.connect(`${pullIP}:${pullPORT}`);
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server Worker connected on port ${pullPORT}`
  );

  // Connect to ZeroMQ - producer (Push)
  const pushSock = zmq.socket('push');
  pushSock.bindSync(`${pushIP}:${pushPORT}`);
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server Producer connected to port ${pushPORT}`
  );

  pullSock.on('message', (data) => {
    io.emit('worker', data.toString());
  });

  io.on('connection', (socket) => {
    socket.on('message', (data) => {
      console.log(data);
      pushSock.send(data);
    });
  });

  /* ---------- END of PUSH/PULL ---------- */

  // Request
  const reqSock = zmq.socket('req');
  reqSock.connect(`${reqIP}:${reqPORT}`);

  io.on('connection', (socket) => {
    socket.on('message', (data) => {
      console.log(data);
      reqSock.send(data.toLowerCase());
    });
  });

  // // Start the server
  // server.listen(port, () => {
  //   console.log('\x1b[32m%s\x1b[0m', `Server started on port ${port}`);
  // });
}

module.exports = {
  startServer,
};
