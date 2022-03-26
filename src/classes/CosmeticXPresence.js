/*
 * Copyright (c) Jan Sohn
 * All rights reserved.
 * Only people with the explicit permission from Jan Sohn are allowed to modify, share or distribute this code.
 *
 * You are NOT allowed to do any kind of modification to this software.
 * You are NOT allowed to share this software with others without the explicit permission from Jan Sohn.
 * You MUST acquire this software from official sources.
 * You MUST run this software on your device as compiled file from our releases.
 *
 */
const DiscordRPC = require("discord-rpc");
class CosmeticXPresence {

	constructor() {
		if (!config.get("presence.only_show_network")) {
			config.set("presence.only_show_network", false);
		}
		this._client = new DiscordRPC.Client({transport: "ipc"});
		this._only_show_network = config.get("presence.only_show_network", false);
	}

	getNetwork() {
		return this._network;
	}

	setNetwork(network = undefined) {
		this._network = network;
		this._client.clearActivity();
	}

	getServer() {
		return this._server || undefined;
	}

	setServer(server = undefined, ends_at = undefined) {
		if (!server) {
			this._client.clearActivity();
		} else {
			this._server = server;
			let obj = {
				details: `Playing on ${this._network}`,
				state: `${this._server}`,
				instance: true,
				timestamps: {
					start: Date.now(),
				},
			};
			if (ends_at) {
				obj.timestamps.end = new Date(ends_at * 1000).getTime();
			}
			this._client.setActivity(obj);
		}
	}

	getRichPresenceClient() {
		return this._client;
	}
}
module.exports = CosmeticXPresence;