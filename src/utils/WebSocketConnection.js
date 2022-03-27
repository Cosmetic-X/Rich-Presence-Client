/*
 * Copyright (c) Jan Sohn
 * All rights reserved.
 * Only people with the explicit permission from Jan Sohn are allowed to modify, share or distribute this code.
 *
 * You are NOT allowed to do any kind of modification to this software.
 * You are NOT allowed to share this software with others without the explicit permission from Jan Sohn.
 * You MUST acquire this software from official sources.
 * You MUST run this software on your device as compiled file from our releases.
 */

const dgram = require("dgram");
const Serializer = require("rpc-protocol/src/Serializer.js");
const PacketPool = require("rpc-protocol/src/PacketPool.js");
const Packet = require("rpc-protocol/src/packets/Packet.js");

global.web_socket_client = dgram.createSocket("udp4");


web_socket_client.on("message", function (raw, remoteInfo) {
	let serializer = Serializer.getSerializer(raw.toString());
	let packet = PacketPool.getInstance().getPacket(serializer.getBuffer());
	packet.decode(serializer);
	console.log(packet);
});

/**
 * @param {Packet} packet
 */
global.sendPacket = (packet) => {
	let serializer = Serializer.getSerializer();
	packet.encode(serializer);
	console.log(serializer.getBuffer());
	web_socket_client.send(serializer.getBuffer(), 0, serializer.getBuffer().length, config["cosmetic-x"]["rpc"]["port"], config["cosmetic-x"]["rpc"]["host"], (err) => {
		if (err) {
			console.error(err);
		} else {
			console.log("Sent packet to " + config["cosmetic-x"]["rpc"]["host"] + ":" + config["cosmetic-x"]["rpc"]["port"]);
		}
	});
}
