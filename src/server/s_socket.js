import { Game } from './s_game.js';
import { EVENTS, encode, decode } from '../helpers/index.js';

// https://socket.io/docs/emit-cheatsheet/

class ServerSocket {
	constructor(io) {
		this.game = new Game(this);

		this.io = io;
		this.io.on(EVENTS.connection, (socket) => {
			const self = this;
			self.recvConnection(socket);

			socket.on(EVENTS.disconnect, () => self.recvDisconnect(socket));
      socket.on(EVENTS.shareSelf, (buffer) => self.fwdShareSelf(socket, buffer));
    
			socket.on(EVENTS.keyChange, (buffer) => self.fwdKeyChange(buffer));
			socket.on(EVENTS.angleChange, (buffer) => self.fwdAngleChange(buffer));
			socket.on(EVENTS.fire, (buffer) => self.recvFire(buffer));
      socket.on(EVENTS.hit, (buffer) => self.recvHit(buffer));
		});
  }

  // ADMIN

	recvConnection(socket) {
		console.log('connection:', socket.id, socket.handshake.query.name);
		this.game.connection(socket, socket.handshake.query.name);
	}

	sendConnection(socket, data) {
    const buffer = encode(EVENTS.addSelf, data);
		socket.broadcast.emit(EVENTS.addNewUser, buffer);
		this.io.to(`${data.userID}`).emit(EVENTS.addSelf, buffer);
	}

	recvDisconnect(socket) {
		console.log('disconnect:', socket.id);
		this.game.disconnect(socket);
	}

	sendRemoveUser(socket) {
		this.io.emit(EVENTS.removeUser, socket.id);
  }

  fwdShareSelf(socket, buffer) {
    const data = decode(EVENTS.shareSelf, buffer);
    const replyBuff = encode(EVENTS.addUser, data.user);
		socket.to(`${data.to}`).emit(EVENTS.addUser, replyBuff);
	}
  
  // HIT

	recvHit(buffer) {
    const data = decode(EVENTS.hit, buffer);
		this.game.hit(data);
	}

	sendHit(data) {
    const buffer = encode(EVENTS.hit, data);
		this.io.emit(EVENTS.hit, buffer);
	}

  // KEY
  
	fwdKeyChange(buffer) {
		this.io.emit(EVENTS.keyChange, buffer);
	}

  // ANGLE

	fwdAngleChange(buffer) {
		this.io.emit(EVENTS.angleChange, buffer);
	}

  // FIRE
  
  recvFire(buffer) {
    const data = decode(EVENTS.fire, buffer);
    // TODO: add a bullet to here to track so we can remove it once it hits (call this.game)
    this.sendFire(data);
  }

	sendFire(data) {
    const buffer = encode(EVENTS.fire, data);
		this.io.emit(EVENTS.fire, buffer);
	}

}

export { ServerSocket }