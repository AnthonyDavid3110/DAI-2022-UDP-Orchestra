const net = require('net');
const dgram = require('dgram');

const protocol = require('./musician-protocol');

// Map to store information about active musicians
let activeMusicians = new Map();

// UDP socket to listen to musicians' broadcasts
const udpSocket = dgram.createSocket('udp4');
udpSocket.bind(protocol.PROTOCOL_PORT, function() {
  udpSocket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// Listen to incoming UDP messages
udpSocket.on('message', function(message) {
  let payload = JSON.parse(message.toString());
  activeMusicians.set(payload.uuid, {
    uuid: payload.uuid,
    instrument: payload.sound,
    activeSince: new Date()
  });
});

// TCP server to accept connection requests from clients
const server = net.createServer(function(socket) {
  // Build the list of active musicians in the desired format
  let musicians = [];
  for (let [key, value] of activeMusicians.entries()) {
    musicians.push({
      uuid: value.uuid,
      instrument: value.instrument,
      activeSince: value.activeSince.toISOString()
    });
  }

  // Send the list of active musicians to the client
  socket.write(JSON.stringify(musicians));
});

server.listen(2205, function() {
  console.log('TCP server listening on port 2205...');
});