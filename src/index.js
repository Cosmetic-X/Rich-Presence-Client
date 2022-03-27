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
const HeartbeatPacket = require("rpc-protocol/src/packets/HeartbeatPacket.js");
const ConnectPacket = require("rpc-protocol/src/packets/ConnectPacket.js");

electron.app.on("ready", async () => {
	createDataFolder();
	Utils.makeTray();
	await Utils.getGamertag().then(gamertag => {
		cache.gamertag = gamertag;
		sendPacket(new ConnectPacket(gamertag));
		setInterval(() => {
			sendPacket(new HeartbeatPacket());
		}, 1000 * 2);
	});
});
electron.app.on("before-quit", async () => {
	//sendPacket(new DisconnectPacket());
});