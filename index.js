const express = require('express');
const spotifyWebApi = require('spotify-web-api-node');

const config = require('./config.json') ?? {
	port: 8080,
	size: 400,
}

const redirect_uri = `http://localhost:${config.port}/callback`

class Ares {
	wonders = null;
	mainWindow = null;
	spotify = null;
	server = express();

	constructor(wonders) {
		this.wonders = wonders;
		this.spotify = new spotifyWebApi({
			clientId: 'fa9d2336a7c74e3aa6ef12baa883511e',
			redirectUrl: redirect_uri,
		});
	}

	async start() {
		this.server.listen(config.port, 'localhost', () => {
			console.log("Listening on port :8080");
		});

		this.mainWindow = await this.wonders.createAndRegisterWindowAsync("spot:main", {
			height: config.size,
			width: config.size,
			minHeight: 250,
			minWidth: 250,
			frame: false,
			transparent: true,
		});

		this.mainWindow.loadURL(`file://${__dirname}./index.html`);

		this.linkIpcEvents();
		this.linkExpressServer();

		//this.redirectToSpotifyAuth();
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
		this.server.get("/callback", function (req, res) {
			var myCode = req.query.code;
			res.send();

			var data = `client_id=${CLIENT_ID}&grant_type=authorization_code`
			+`&code=${myCode}&redirect_uri=${REDIRECT_URI}&code_verifier=${codeVerifier}`;
			
			if (req.query.state != codeState) {
				console.log('bad state, trying again');
				window.load = URL(auth.getAuthUrl());
			} else {
				fetch('https://accounts.spotify.com/api/token/', {
					method: 'POST',
					headers: {'Content-Type':'application/x-www-form-urlencoded'},
					body: data
				})
				.then(res => res.json())
				.then(json => {
					if (json.error) {
						this.redirectToSpotifyAuth();
					} else {
						spotifyApi.setAccessToken(json.access_token);
						spotifyApi.setRefreshToken(json.refresh_token);
						constants.saveRToken(json.refresh_token);
						this.redirectToApp();
					};
				});
				
				server.close();
			};
		});
	}

	getSpotifyAuthUrl() {
		var scopes = ['user-read-private', 'user-read-email'],
			state = 'spot-widget-login',
			showDialog = true,
			responseType = 'token';

		var authorizeURL = this.spotify.createAuthorizeURL(
			scopes,
			state,
			showDialog,
			responseType,
		);

		return authorizeURL;
	}

	async redirectToSpotifyAuth() {
		this.mainWindow.loadURL(this.getSpotifyAuthUrl());
	}

	async redirectToApp() {
		this.mainWindow.loadFile(`file://${__dirname}./index.html`);
	}

	async stop() {
		this.mainWindow.close();
	}
};

module.exports = (wonders) => new Ares(wonders);