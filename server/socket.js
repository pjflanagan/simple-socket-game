import { Game } from './game.js'
// https://socket.io/docs/emit-cheatsheet/

class ServerSocket {
	constructor(io) {
		this.game = new Game(this);

		this.io = io;
		this.io.on('connection', (socket) => {
			const self = this;
			self.recvConnection(socket);

			socket.on('disconnect', () => self.recvDisconnect(socket));
			socket.on('shareSelf', (data) => self.shareSelf(socket, data));
			socket.on('keyChange', (data) => self.keyChange(data));
			socket.on('angleChange', (data) => self.angleChange(data));
			socket.on('stateUpdate', (data) => self.stateUpdate(socket, data));

			socket.on('fire', (data) => self.fire(data));
		});
	}

	addRoom(game) {
		this.game = game; // server socket should have multiple games this.games.push(game)
	}

	// connect
	recvConnection(socket) {
		console.log('connection:', socket.id);
		this.game.connection(socket);
	}

	sendConnection(socket, user) {
		socket.broadcast.emit('addNewUser', user);
		this.io.to(`${user.i}`).emit('addSelf', user);
	}

	// disconnect
	recvDisconnect(socket) {
		this.game.disconnect(socket);
	}

	sendDisconnect(socket) {
		this.death(socket);
	}

	// death
	death(socket) {
		console.log('death:', socket.id);
		this.io.emit('death', socket.id);
	}

	// share self
	shareSelf(socket, data) {
		socket.to(`${data.to}`).emit('addUser', data.user);
	}

	// state update
	stateUpdate(socket, data) {
		socket.broadcast.emit('stateUpdate', data);
	}

	// key change
	keyChange(data) {
		this.io.emit('keyChange', data);
	}

	// key change
	angleChange(data) {
		this.io.emit('angleChange', data);
	}

	// fire
	fire(data) {
		this.io.emit('fire', data);
	}


}

export { ServerSocket }