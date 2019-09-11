import { Game } from './s_game.js';
import { EVENTS } from '../helpers/index.js';

// https://socket.io/docs/emit-cheatsheet/

class ServerSocket {
	constructor(io) {
		this.game = new Game(this);

		this.io = io;
		this.io.on(EVENTS.connection, (socket) => {
			const self = this;
			self.recvConnection(socket);

			socket.on(EVENTS.disconnect, () => self.recvDisconnect(socket));
			socket.on(EVENTS.shareSelf, (data) => self.shareSelf(socket, data));
			socket.on(EVENTS.keyChange, (data) => self.keyChange(data));
			socket.on(EVENTS.angleChange, (data) => self.angleChange(data));
			socket.on(EVENTS.stateUpdate, (data) => self.stateUpdate(socket, data));
			socket.on(EVENTS.fire, (data) => self.fire(data));
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
		socket.broadcast.emit(EVENTS.addNewUser, user);
		this.io.to(`${user.i}`).emit(EVENTS.addSelf, user);
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
		this.io.emit(EVENTS.death, socket.id);
	}

	// share self
	shareSelf(socket, data) {
		socket.to(`${data.to}`).emit(EVENTS.addUser, data.user);
	}

	// state update
	stateUpdate(socket, data) {
		socket.broadcast.emit(EVENTS.stateUpdate, data);
	}

	// key change
	keyChange(data) {
		this.io.emit(EVENTS.keyChange, data);
	}

	// key change
	angleChange(data) {
		this.io.emit(EVENTS.angleChange, data);
	}

	// fire
	fire(data) {
		this.io.emit(EVENTS.fire, data);
	}


}

export { ServerSocket }