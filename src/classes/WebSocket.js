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

const net = require("net");
const Serializer = require("rpc-protocol/src/Serializer.js");
const PacketPool = require("rpc-protocol/src/PacketPool.js");
const Packet = require("rpc-protocol/src/packets/Packet.js");
const UnknownPacket = require("rpc-protocol/src/packets/UnknownPacket.js");
const UpdateServerPacket = require("rpc-protocol/src/packets/UpdateServerPacket.js");
const ConnectPacket = require("rpc-protocol/src/packets/ConnectPacket.js");
const HeartbeatPacket = require("rpc-protocol/src/packets/HeartbeatPacket.js");

class WebSocket {
	constructor() {
		process.on("beforeExit", () => {
			if (this._client) {
				console.log("[WebSocket] Closing..");
				this._client.destroy();
				console.log("[WebSocket] Closed.");
			}
		});
		this._client = new net.Socket();
		this._client.on("connect", () => this.onConnect());
		this._client.on("data", (raw) => {
			console.log(raw.toString())
			this.onData(raw);
		});
		this._client.on("error", (e) => this.onError(e));
		this._client.on("close", () => this.onClose());
		this._client.connect(config["cosmetic-x"]["rpc"]["port"], config["cosmetic-x"]["rpc"]["host"]);
	}

	async onConnect() {
		console.log("RPC-Socket is listening on " + this._client.remoteFamily + " " + this._client.remoteAddress + ":" + this._client.remotePort);
		let gamertag = await Utils.getGamertag();
		console.log("Sending connect packet to server");
		this.sendPacket(new ConnectPacket(gamertag));
		setInterval(() => this.sendPacket(new HeartbeatPacket()), 1000 * 2);
	}

	onData(raw) {
		let serializer = Serializer.getSerializer(raw.toString());
		let packet = PacketPool.getInstance().getPacket(serializer.getBuffer());
		packet.decode(serializer);

		if (packet instanceof UpdateServerPacket) {
			console.log("GOT UPDATE SERVER PACKET");
			CosmeticXPresence.setServer(packet.network, packet.domain, packet.server, packet.ends_at);
		} else if (packet instanceof UnknownPacket) {
			console.log("Unknown packet received");
		} else {
			console.log("Received unhandled packet");
		}
	}

	onClose() {
	}

	onError(e) {
		console.error("[WebSocket] Error: " + e.message);
	}

	sendPacket(packet) {
		let serializer = Serializer.getSerializer();
		packet.encode(serializer);
		this._client.write(serializer.getBuffer());
	}
}
module.exports = WebSocket;