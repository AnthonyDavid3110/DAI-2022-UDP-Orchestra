const protocol = require('./musician-protocol');

// We use a standard Node.js module to work with UDP
const dgram = require('dgram');

// Let's create a datagram socket. We will use it to send our UDP datagrams
const socket = dgram.createSocket('udp4');

// Package used to generate uuid
const uuid = require('uuid');

// Association of instruments with their sound
const sound = {
    piano : 'ti-ta-ti',
    trumpet : 'pouet',
    flute : 'trulu',
    violin : 'gzi-gzi',
    drum : 'boum-boum'
}

function generate_musician(instrument) {
    this.sound = sound[instrument];
    this.uuid = uuid.v4();


    this.update = function() {
        // Data to send
        const music = {
            uuid: this.uuid,
            sound: this.sound
        };

        // Put data in a JSON string
        const payload = JSON.stringify(music);

         // Put the payload in a datagram and sending
        const message = new Buffer(payload);

        socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
        console.log("Sending payload: " + payload + " via port " + socket.address().port);
         });
    };
    // Set interval every 1000m
    setInterval(this.update.bind(this), 1000);
}

var musician = new generate_musician(process.argv[2]);