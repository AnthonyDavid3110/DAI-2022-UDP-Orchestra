const net = require('net');
const dgram = require('dgram');

const protocol = require('./musician-protocol');
const tcpprotocol = require('./auditor-protocol');

// Create a TCP server
const server = net.createServer(function(socket) {
  console.log('Client connected');

  // Create a datagram socket for listening to UDP messages
  const udp_socket = dgram.createSocket('udp4');

  // Array to store information about active musicians
  let activeMusicians = [];

  udp_socket.on('message', function(message, remote) {
    // Parse the received message
    let data = JSON.parse(message);

    // Check if the received message is from a musician
    if (data.hasOwnProperty('uuid') && data.hasOwnProperty('sound')) {
      let musician = {
        uuid: data.uuid,
        instrument: data.sound,
        activeSince: new Date()
      };

      // Add the musician to the array of active musicians
      activeMusicians.push(musician);

      console.log('Received message from a musician: ', data);
    }
  });

  udp_socket.bind(protocol.PROTOCOL_PORT, function() {
    console.log('UDP socket listening on port ' + protocol.PROTOCOL_PORT);
    udp_socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
  });

  // Send the list of active musicians to the client when it connects
  socket.write(JSON.stringify(activeMusicians));

  // Remove inactive musicians from the list every 5 seconds
  setInterval(function() {
    for (let i = activeMusicians.length - 1; i >= 0; i--) {
      if (new Date() - activeMusicians[i].activeSince > 5000) {
        console.log('Removing inactive musician: ', activeMusicians[i].uuid);
        activeMusicians.splice(i, 1);
      }
    }
  }, 5000);

  socket.on('end', function() {
    console.log('Client disconnected');
    udp_socket.close();
  });
});

server.listen(tcpprotocol.PROTOCOL_PORT, function() {
  console.log('TCP server listening on port ' + tcpprotocol.PROTOCOL_PORT);
});