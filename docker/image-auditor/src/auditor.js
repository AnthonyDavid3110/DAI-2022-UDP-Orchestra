// Protocol
const protocol = require('./auditor-protocol.js');

const dgram = require('dgram');

const TCP_PORT = 2205;

const net = require('net');

// Association of instruments with their sound
const instruments = {
  piano : 'ti-ta-ti',
  trumpet : 'pouet',
  flute : 'trulu',
  violin : 'gzi-gzi',
  drum : 'boum-boum'
}

class Musician {
  constructor(uuid, instrument, activeSince) {
    this.uuid = uuid;
    this.instrument = instrument;
    this.activeSince = activeSince;
  }
}

// Active musicians
let musicians = new Map();

// Let's create a datagram socket. We will use it to listen for datagrams published in the
// multicast group by musicians
const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, () => {
    console.log("Joining multicast group");
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// TCP server
var tcp_socket = net.createServer();
tcp_socket.listen(TCP_PORT);

tcp_socket.on('connection', (socket) => {
    socket.write(JSON.stringify(Array.from(musicians.keys()), null, 2));
    socket.end();
});

// This call back is invoked when a new datagram has arrived.
s.on('message', (msg, source) => {
    var data = JSON.parse(msg, null, 2);
    let found = false;
  
    // Update the value
    musicians.forEach((value, key, map) => {
      if (key.uuid == data.uuid) {
        musicians.set(key, Date.now());
        found = true;
      }
      console.log("Datagram received and new musicians added");
    });


    
  // Insert a new Musician if not in the list
  if (!found) {
    let instrument;
    for ([key, val] of Object.entries(instruments))
    {
      if (val == data.sound) {
        instrument = key;
        break;
      }
    }
    musicians.set(new Musician(data.uuid, instrument, new Date()), Date.now());
  }
});

setInterval(() => {
    musicians.forEach((value, key, map) => {
      if (Date.now() - value > 5000) {
        musicians.delete(key);
      }
    });
  }, 100);
  