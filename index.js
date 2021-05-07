const fetch = require('node-fetch');
const express = require('express');
const spotifyWebApi = require('spotify-web-api-node');

const config = require('./config.json') ?? {
	size: 400,
}

const PORT = 8888;
const CLIENT_ID = 'fa9d2336a7c74e3aa6ef12baa883511e';
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback/`;

class Ares {
	wonders = null;
	mainWindow = null;
	spotify = null;
	server = null;

	constructor(wonders) {
		this.wonders = wonders;
		this.spotify = new spotifyWebApi({
			clientId: CLIENT_ID,
			redirectUrl: REDIRECT_URI,
		});
		this.server = express();
	}

	async start() {
		this.mainWindow = await this.wonders.createWidgetWindowAsync("ares:main", {
			height: config.size,
			width: config.size,
			minHeight: 250,
			minWidth: 250,
			frame: false,
		});

		this.mainWindow.loadURL(`file://${__dirname}/index.html`);

		await this.linkIpcEvents();
		await this.linkExpressServer();

		this.redirectToSpotifyAuth();
	}

	async linkIpcEvents() {
		this.wonders.ipcMain.on("set-square", (event, arg) => {
			width = (window.getSize())[0];
			height = (window.getSize())[1];
			if (width < height) {
				window.setSize(width, width);
			} else if (height < width) {
				window.setSize(height, height);
			};
		});
	}

	async linkExpressServer() {
		this.server.get("/callback", async function (req, res) {
			console.log(res);
			var myCode = req.query.code;
			res.send();

			var data = `client_id=${CLIENT_ID}&grant_type=authorization_code`
			+`&code=${myCode}&redirect_uri=${REDIRECT_URI}&code_verifier=${codeVerifier}`;
			
			if (req.query.state != codeState) {
				console.log('bad state, trying again');
				window.load = URL(auth.getAuthUrl());
			} else {
				var res = await fetch('https://accounts.spotify.com/api/token/', {
					method: 'POST',
					headers: {'Content-Type':'application/x-www-form-urlencoded'},
					body: data
				});
				var json = res.json();
				console.log(json);
				if (json.error) {
					this.redirectToSpotifyAuth();
				} else {
					spotifyApi.setAccessToken(json.access_token);
					spotifyApi.setRefreshToken(json.refresh_token);
					this.redirectToApp();
				};
				
				server.close();
				console.log("Closed callback express server.");
			};
		});

		this.server.listen(config.port, () => {
			console.log(`Listening for callback on port :${PORT}.`);
		});
	}

	getSpotifyAuthUrl() {
		var scopes = ['user-read-private', 'user-read-email'],
			state = 'ares-widget-login',
			showDialog = true,
			responseType = 'token';

		var authorizeURL = this.spotify.createAuthorizeURL(
			scopes,
			state,
			showDialog,
			responseType,
		) + `&redirect_uri=${REDIRECT_URI}`;
		
		return authorizeURL;
	}

	async redirectToSpotifyAuth() {
		this.mainWindow.loadURL(this.getSpotifyAuthUrl());
	}

	async redirectToApp() {
		this.mainWindow.loadURL(`file://${__dirname}/index.html`);
	}

	async stop() {
		this.mainWindow.close();
	}
};

module.exports = (wonders) => new Ares(wonders);