const dgram = require("dgram");
global.web_socket = dgram.createSocket("udp4");