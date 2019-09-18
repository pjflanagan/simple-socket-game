'use strict';

// https://github.com/riebel/socketio-es6-starter

import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import path from 'path';
import bodyParser from 'body-parser';
import { ServerSocket } from './s_socket.js'
// import compression from 'compression';

const app = express();
const server = http.Server(app);
const io = new SocketIO(server);
const port = process.env.PORT || 6415;
new ServerSocket(io);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.get('/', function (req, res) {
	res.render('index');
});

app.get('/game', function (req, res) {
	res.render('game');
});

// app.use(compression({}));
app.use('/assets', express.static(path.resolve(__dirname + '/../../assets')));
app.use('/dist', express.static(path.resolve(__dirname + '/../../dist')));
app.use('/packages', express.static(path.resolve(__dirname + '/../packages')));


// TODO: make a debug option so you can test on multiple computers
// https://stackoverflow.com/questions/30712141/connect-to-localhost3000-from-another-computer-expressjs-nodejs
server.listen(port, () => {
  console.log('[INFO] Listening on *:' + port);
});
