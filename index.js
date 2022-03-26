const CosmeticXPresence = require("./src/classes/CosmeticXPresence.js");

global.pkg = require("./package.json");
global.config = require('./resources/config.json');

global.cache = {};
global.libraries = {
	fs: require("fs"),
	path: require("path"),
};
global.Presence = new CosmeticXPresence();

global.DATA_FOLDER = function (path) {
	return libraries.path.join(libraries.path.join((require("appdata-path"))("Cosmetic-X"), "/"), path || "");
};
global.COSMETICX_NATIVE_IMAGE = electron.nativeImage.createFromPath(libraries.path.join("resources/images", "logo.png"));

global.config = {
	getAll: () => {
		if (!libraries.fs.existsSync(DATA_FOLDER("config.json"))) {
			libraries.fs.writeFileSync(DATA_FOLDER("config.json"), "{}");
			return {};
		}
		return JSON.parse(libraries.fs.readFileSync(DATA_FOLDER("config.json")).toString());
	},
	set: (key, value) => {
		let config = this.getAll();
		config[ key ] = value;
		libraries.fs.writeFileSync(DATA_FOLDER("config.json"), JSON.stringify(config, null, 4));
	},
	get: (key, default_value = undefined) => {
		return this.getAll()[ key ] || default_value;
	},
};
global.electron = require("electron");
const DiscordRPC = require('discord-rpc');
DiscordRPC.register(config.discord.application_id);
(require("electron-discord-register"))(config.discord.application_id);

try {
	require("./src/utils/Utils.js");
} catch (e) {
	console.error(e);
}
createDataFolder();

require("./src/index.js");
