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

const CosmeticXPresence = require("./src/classes/CosmeticXPresence.js");

global.pkg = require("./package.json");
global.config = require('./resources/config.json');
global.__debug = false;

if (process.env.USERDOMAIN === "JANPC") {
	__debug = true;
	config["cosmetic-x"]["rpc"]["host"] = "localhost";
}

global.cache = {};
global.libraries = {
	fs: require("fs"),
	path: require("path"),
};

global.DATA_FOLDER = function (path) {
	return libraries.path.join(libraries.path.join((require("appdata-path"))("Cosmetic-X"), "/"), path || "");
};
global.COSMETICX_NATIVE_IMAGE = (require("electron")).nativeImage.createFromPath(libraries.path.join("resources/images", "logo.png"));

global.getEntireConfig = () => {
	if (!libraries.fs.existsSync(DATA_FOLDER("config.json"))) {
		libraries.fs.writeFileSync(DATA_FOLDER("config.json"), "{}");
		return {};
	}
	return JSON.parse(libraries.fs.readFileSync(DATA_FOLDER("config.json")).toString());
};
global.setConfig = (key, value) => {
	let config = getEntireConfig();
	config[ key ] = value;
	libraries.fs.writeFileSync(DATA_FOLDER("config.json"), JSON.stringify(config, null, 4));
};
global.getConfig = (key, default_value = undefined) => {
	return getEntireConfig()[ key ] || default_value;
};

global.Presence = new CosmeticXPresence();
global.electron = require("electron");
electron.app.setAppUserModelId("de.cosmetic-x.client")

const DiscordRPC = require('discord-rpc');
DiscordRPC.register(config.discord.application_id);
(require("electron-discord-register"))(config.discord.application_id);

try {
	global.Utils = require("./src/utils/Utils.js");
	require("./src/utils/WebSocketConnection.js");
	//TODO: Add more
} catch (e) {
	console.error(e);
}

require("./src/index.js");
