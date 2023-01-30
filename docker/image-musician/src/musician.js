// Paramater of connection
const protocol = require('./musician-protocol');

// We use a standard Node.js module to work with UDP
const dgram = require('dgram');

// Let's create a datagram socket. We will use it to send our UDP datagrams
const socket = dgram.createSocket('udp4');

// Package used to generate uuid
const uuid = require('uuid');

// Association of instruments with their sound
const instruments = {
    piano : 'ti-ta-ti',
    trumpet : 'pouet',
    flute : 'trulu',
    violin : 'gzi-gzi',
    drum : 'boum-boum'
}

class Musician {
    constructor(instrument) {
    this.sound = instruments[instrument];
    this.uuid = uuid.v4();
    this.update();
    }
    
    
    update() {
        const music = {
            uuid: this.uuid,
            sound: this.sound
        };
    
        const payload = JSON.stringify(music);
        const message = new Buffer(payload);
        socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log(`Sending payload: ${payload} via port ${socket.address().port}`);
        });
        setInterval(this.update.bind(this), 1000);
    }

}

const instrument = process.argv[2];
const musician = new Musician(instrument);