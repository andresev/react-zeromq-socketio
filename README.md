# React/React-Native ZeroMQ-SocketIO Bridge

This is a simple ZeroMQ to React/React Native Bridge using SocketIO. This package can also be used with any project that uses SocketIO.

## Installation

`npm install react-zeromq-socketio`
or
`yarn add react-zeromq-socketio`

## Usage

In this package, there's a few steps to get started:

### Create a file

First, you will need to create a file anywhere you want in your project.

### Insert the following code into file

Here's a full example of how to use `react-zeromq-socketio` to start a server with custom options within file:

```js
const zmqServer = require('react-zeromq-socketio');

const options = {
  port: 3005,
  subIP: 'tcp://127.0.0.1',
  subPORT: 5555,
  subTOPIC: 'topic',
  subEventName: 'sub',
  pubIP: 'tcp://127.0.0.1',
  pubPORT: 5556,
  pubTOPIC: 'topic',
  pubEventName: 'message',
  pullIP: 'tcp://127.0.0.1',
  pullPORT: 5557,
  pullEventName: 'worker',
  pushIP: 'tcp://127.0.0.1',
  pushPORT: 5558,
  pushEventName: 'message',
  reqIP: 'tcp://127.0.0.1',
  reqPORT: 5559,
  reqEventName: 'message',
  repIP: 'tcp://127.0.0.1',
  repPORT: 5560,
  repEventName: 'message', // Currently not used
  repREQUEST: 'Hello',
  repREPLY: 'World',
};

zmqServer.StartServer(options);
```

That is all for this part. Although this is an example, these options do have defaults if not set, which are the following:

```js
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
```

NOTE: PORT's should be different from each other. For example: if you're PUBLISHING to this server, then you would use SUBSCRIBER within this file.

Defaults work. Just add a SocketIO port. Following example for minimal setup:

```js
const zmqServer = require('react-zeromq-socketio');

const options = {
  port: 3005,
};

zmqServer.StartServer(options);
```

If you're having trouble, don't hesitate to send me a message.

## Front-End Example with React Native

This has been tested with React Native. Although, I'm sure it'll work with React too. Just need to setup SocketIO with the right `ServerURL` and `port`.

The following example below will show a React Native Component importing SocketIO:

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import io from 'socket.io-client';

const serverURL = 'http://localhost:3005';
const socket = io(serverURL);

const Dev = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [worker, setWorker] = useState('');

  useEffect(() => {
    // Establish connection to server
    socket.on('connect', () => {
      console.log('Connected to server!');
    });

    // Listen for incoming messages from the server over Socket.io
    // Make sure EventName('sub') is the same as subEventName
    // Change this if you're using default to 'message'
    socket.on('sub', (data) => {
      setResponse(data); // SUBSCRIBER received message from PUBLISHER
    });

    // Make sure EventName('worker') is the same as pullEventName
    socket.on('worker', (data) => {
      setWorker(data); // WORKER received message from PRODUCER
    });

    return () => {
      // Disconnect from the server when the component unmounts
      socket.disconnect();
      console.log('Disconnected from server');
    };
  }, []);

  const sendMessage = () => {
    // Send a message to the server over Socket.io
    // Technically this is used as a PUBLISHER, or PUSH.
    // Make sure EventName('message') is the same.
    socket.emit('message', message);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        value={message}
        onChangeText={setMessage}
        style={{ borderWidth: 1, padding: 10, margin: 10, width: '80%' }}
      />
      <Button title="Send" onPress={sendMessage} />
      {response ? <Text>Subber Data: {response}</Text> : null}
      {worker ? <Text>Worker Data: {worker}</Text> : null}
    </View>
  );
};

export default Dev;
```

This component works with the first set of options. If you just want to see a simple PUB/SUB example. Just replace your EventName('sub', 'worker') to the default `message`.

## Contributing

Just started this out by looking for a solution to send ZeroMQ data to the front-end. If you would like to contribute, don't hesitate to contact me. Check out my Github: andresev

# Acknowledgments

I would like to thank the following resources and individuals for their help in creating this package:

- Colleen Boehme - for providing valuable feedback and suggestions.
- Noah Reed - for providing valuable feedback and suggestions during the development process.

- [SocketIO](https://socket.io/) - for providing a powerful high-performance light-weight messaging library that allowed me to communicate with React/React-Native.
- [ZeroMQ](https://zeromq.org/) - for providing a high-performance messaging library that allowed me to build the socket communication layer of this package.

Thank you all for your contributions to this project!
