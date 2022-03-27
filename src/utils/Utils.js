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
const {exec} = require("child_process");
const getAppDataPath = require("appdata-path");


global.createDataFolder = function () {
	if (!libraries.fs.existsSync(DATA_FOLDER())) {
		libraries.fs.mkdirSync(DATA_FOLDER(), {recursive: true});
	}
};
global.deleteDataFolder = function () {
	electron.dialog.showMessageBox({
		title: "Are you sure?",
		message: "Delete all files from this application",
		type: "warning",
		buttons: [ "No, keep it", "Yes, delete all files" ],
		defaultId: 0,
	}).then(messageBoxReturnValue => {
		if (messageBoxReturnValue.response === 1) {
			libraries.fs.rmSync(DATA_FOLDER(), {recursive: true});
			createDataFolder();
		}
	});
};

class Utils {
	static hasMinecraftBedrockEditionInstalled(showErrorBox = false) {
		let promise = new Promise((resolve) => {
			exec("Get-AppPackage -name Microsoft.MinecraftUWP | select -expandproperty Architecture", {'shell': 'powershell.exe'}, (error, strout, strerr) => {
				if (strout !== "") {
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
		promise.then(installed => {
			if (installed === false && showErrorBox) {
				electron.dialog.showErrorBox("Error", "Minecraft: Bedrock Edition is not installed");
			}
		});
		return promise;
	}

	static getGamertag() {
		return new Promise(async (resolve, reject) => {
			if (!await this.hasMinecraftBedrockEditionInstalled(true)) {
				return;
			}
			console.log(libraries.path.join(process.env.LOCALAPPDATA + "\\Packages\\Microsoft.XboxApp_8wekyb3d8bbwe\\LocalState\\XboxLiveGamer.xml"));
			if (libraries.fs.existsSync(libraries.path.join(process.env.LOCALAPPDATA + "\\Packages\\Microsoft.XboxApp_8wekyb3d8bbwe\\LocalState\\XboxLiveGamer.xml"))) {
				setConfig("Gamertag", JSON.parse(libraries.fs.readFileSync(libraries.path.join(process.env.LOCALAPPDATA + "\\Packages\\Microsoft.XboxApp_8wekyb3d8bbwe\\LocalState\\XboxLiveGamer.xml")).toString()).Gamertag);
				resolve(getConfig("Gamertag"));
			} else {
				electron.dialog.showErrorBox("Error", "Couldn't penetrate XBOX-Live, please re-login to your XBOX-Live account.");
			}
		});
	}

	static makeTray(icon) {
		if (!cache.tray) {
			cache.tray = {};
		}
		if (!cache.tray.instance) {
			cache.tray.instance = new electron.Tray(COSMETICX_NATIVE_IMAGE.resize({width: 16}));
		}
		cache.tray.contextMenu = [];
		cache.tray.contextMenu[ cache.tray.contextMenu.length ] = {
			label: "Delete all files",
			click: () => {
				deleteDataFolder();
			},
		};
		cache.tray.contextMenu[ cache.tray.contextMenu.length ] = {
			label: 'Close',
			click: () => {
				electron.app.quit();
			},
		};
		cache.tray.instance.setIgnoreDoubleClickEvents(true);
		cache.tray.instance.setContextMenu(electron.Menu.buildFromTemplate(cache.tray.contextMenu));
		cache.tray.instance.setTitle("Cosmetic-X");
		cache.tray.instance.setToolTip("Cosmetic-X");
	}
}
module.exports = Utils;
