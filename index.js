function StartServer(options) {
  const express = require('express');
  const http = require('http');
  const zmq = require('zeromq');
  const socketIO = require('socket.io');
  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server);

  // SocketIO port
  const port = options.port || 3005;

  /* SUBSCRIBER Settings */
  const subIP = options.subIP || 'tcp://127.0.0.1';
  const subPORT = options.subPORT || 5555;
  const subTOPIC = options.subTOPIC || 'topic';
  const subEventName = options.subEventName || 'message';

  /* PUBLISHER Settings */
  const pubIP = options.pubIP || 'tcp://127.0.0.1';
  const pubPORT = options.pubPORT || 5556;
  const pubTOPIC = options.pubTOPIC || 'topic';
  const pubEventName = options.pubEventName || 'message';

  /* PULL Settings */
  const pullIP = options.pullIP || 'tcp://127.0.0.1';
  const pullPORT = options.pullPORT || 6666;
  const pullEventName = options.pullEventName || 'message';

  /* PUSH Settings */
  const pushIP = options.pushIP || 'tcp://127.0.0.1';
  const pushPORT = options.pushPORT || 6667;
  const pushEventName = options.pushEventName || 'message';

  /* REQUEST Settings */
  const reqIP = options.reqIP || 'tcp://127.0.0.1';
  const reqPORT = options.reqPORT || 7777;
  const reqEventName = options.reqEventName || 'message';

  /* REPLY Settings */
  const repIP = options.repIP || 'tcp://127.0.0.1';
  const repPORT = options.repPORT || 7778;
  const repEventName = options.repEventName || 'message';
  const repREQUEST = options.repCODE || 'Hello';
  const repREPLY = options.repREPLY || 'World';

  /* ---------- PUB/SUB ---------- */

  /* Note: removing .subcribe(""), you need to remove 'topic' from parameter 
    INSTEAD, just add simple topic rather than no topic. 
    Default: 'topic' for subscriber and publisher
  */

  // Connect to ZeroMQ and subscribe to a topic
  const subSock = zmq.socket('sub');
  subSock.connect(`${subIP}:${subPORT}`);
  subSock.subscribe(`${subTOPIC}`);
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
  subSock.on('message', (topic, data) => {
    io.emit(`${subEventName}`, data.toString());
  });

  // Listen for messages from React Native SocketIO and send to Subscriber
  io.on('connection', (socket) => {
    socket.on(`${pubEventName}`, (data) => {
      console.log('message received', data);
      pubSock.send([`${pubTOPIC}`, data]);
    });
  });

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

  // Listens for PUSH and PULLS data to emit to device (SocketIO)
  pullSock.on('message', (data) => {
    io.emit(`${pullEventName}`, data.toString());
  });

  io.on('connection', (socket) => {
    socket.on(`${pushEventName}`, (data) => {
      pushSock.send(data);
    });
  });

  /* ---------- REQUEST/REPLY ---------- */

  // ZeroMQ Request
  const reqSock = zmq.socket('req');
  reqSock.connect(`${reqIP}:${reqPORT}`);
  console.log(
    '\x1b[32m%s\x1b[0m',
    `Server Request connected to port ${reqPORT}`
  );

  // ZeroMQ Reply
  const repSock = zmq.socket('rep');
  repSock.bind(`${repIP}:${repPORT}`);
  console.log('\x1b[32m%s\x1b[0m', `Server Reply connected to port ${repPORT}`);

  // Listening for REQ and sends back REP
  repSock.on('message', (data) => {
    console.log(`REP received request: ${data.toString()}`);
    console.log('REP sending response');
    switch (data.toString()) {
      case repREQUEST:
        repSock.send(repREPLY);
    }
  });

  // REQ from App(SocketIO) and send to REP
  io.on('connection', (socket) => {
    socket.on(`${reqEventName}`, (data) => {
      reqSock.send(data);
    });
  });

  // Receives reply from REP
  reqSock.on('message', (reply) => {
    console.log(reply.toString());
  });

  // Start the server
  server.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server started on port ${port}`);
  });
}

module.exports = {
  StartServer,
};
