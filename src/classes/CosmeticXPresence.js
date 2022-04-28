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
const superagent = require("superagent");
const net = require("net");
const UnknownPacket = require("rpc-protocol/src/packets/UnknownPacket.js");

class CosmeticXPresence {
	clientReady = false;

	constructor() {
		this._client = new (require("discord-rpc")).Client({transport: "ipc"});
		this._client.on("disconnect", () => {
			console.log("[CosmeticXPresence] Disconnected from Discord.");
			this.clientReady = false;
			console.log("[CosmeticXPresence] Trying to reconnect...");
			this.initialize();
			this.login();
		});
	}

	initialize() {
		if (this._client) {
			let client = this._client;
			require("discord-rpc/src/client.js").prototype.authorize = async function ({ scopes, clientSecret, rpcToken, redirectUri, prompt } = {}) {
				if (clientSecret && rpcToken === true) {
					const body = await client.fetch("POST", "/oauth2/token/rpc", {
						data: new URLSearchParams({
							client_id: this._client.clientId,
							client_secret: clientSecret
						}),
					});
					rpcToken = body.rpc_token;
				}
				// noinspection JSUnresolvedFunction
				const { code } = await client.request("AUTHORIZE", {
					scopes,
					client_id: client.clientId,
					prompt,
					rpc_token: rpcToken,
				});
				const response = await client.fetch("POST", "/oauth2/token", {
					data: new URLSearchParams({
						client_id: client.clientId,
						client_secret: clientSecret,
						code,
						grant_type: 'authorization_code',
						redirect_uri: redirectUri,
					}),
				});
				setConfig("access_token", client.access_token = response.access_token);
				setConfig("expires_at", client.expires_at = new Date().getSeconds() +response["expires_in"]);
				return response.access_token;
			}
		} else {
			console.error("[CosmeticXPresence] Discord RPC client not found!");
		}
	}

	login() {
		let obj = {
			clientId: config.discord.application_id,
			clientSecret: config.discord.application_secret,
			redirectUri: "https://cosmetic-x.de/",
		};
		if (getConfig("discord.access_token", false)) {
			obj[ "accessToken" ] = this.access_token = getConfig("discord.access_token", false);
		}
		if (getConfig("expires_at", undefined) !== undefined) {
			this.expires_at = Number.parseInt(getConfig("discord.expires_at", undefined));
			if (new Date().getSeconds() >= this.expires_at) {
				delete obj[ "accessToken" ];
				this.access_token = undefined;
			}
		}
		if (getConfig("discord.expires_at", undefined) === undefined && getConfig("discord.access_token", undefined) !== undefined) {
			delete setConfig("discord.access_token", this.access_token = undefined);
		}
		this._client.login(obj).then(client => {
			this.onReady();
		});
	}

	onReady() {
		this.clientReady = true;
		console.log("[CosmeticXPresence] Logged in to Discord RPC.");
		this._client.setActivity({
			instance: true,
			details: "Loading...",
			largeImageKey: "logo",
		});
		//TODO: connect to web socket from backend and remove the old code
		setTimeout(() => {
			this._sendIdlePresence();
			global.WebSocket = new (require("./WebSocket.js"))();
			//WebSocket.sendPacket(new UnknownPacket());
		}, randomInt(2, 10) * 1000);
	}

	getDomain() {
		return this._domain;
	}

	getNetwork() {
		return this._network;
	}

	getServer() {
		return this._server || undefined;
	}

	getEndsAt() {
		return this._ends_at;
	}

	_sendIdlePresence() {
		this._client.setActivity({
			instance: true
		});
	}

	setServer(network, domain, server, ends_at) {
		this._network = network;
		this._server = server;
		this._domain = domain;
		this._ends_at = ends_at;

		if (!network) {
			this._network = this._server = this._domain = this._ends_at = undefined;
			this._sendIdlePresence();
		} else {
			let obj = {
				details: domain || network,
				state: server,
				largeImageKey: "logo",
				largeImageText: "Cosmetic-X",
				instance: false,
				startTimestamp: Date.now(),
			};
			if (this._ends_at !== undefined) {
				obj.endTimestamp = !this._ends_at ? undefined : new Date(Date.now() + this._ends_at * 1000);
			}
			this._client.setActivity(obj);
		}
	}

	getRichPresenceClient() {
		return this._client;
	}
}
module.exports = CosmeticXPresence;