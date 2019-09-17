import { Game } from './s_game.js';
import { EVENTS } from '../helpers/index.js';
import * as msgpack from 'msgpack-lite';

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
			socket.on(EVENTS.stateUpdate, (buffer) => self.fwdStateUpdate(socket, buffer));
			socket.on(EVENTS.fire, (buffer) => self.recvFire(buffer));
      socket.on(EVENTS.hit, (buffer) => self.recvHit(buffer));
		});
  }
  
  // TODO: use this
  // handle(socket, buffer, func) {
  //   const data = msgpack.decode(new Uint8Array(buffer));
  //   return func(socket, data);
  // }

  // Admin

	recvConnection(socket) {
		console.log('connection:', socket.id, socket.handshake.query.name);
		this.game.connection(socket, socket.handshake.query.name);
	}

	sendConnection(socket, data) {
    const buffer = msgpack.encode(data);
		socket.broadcast.emit(EVENTS.addNewUser, buffer);
		this.io.to(`${data.i}`).emit(EVENTS.addSelf, buffer);
	}

	recvDisconnect(socket) {
		this.game.disconnect(socket);
	}

	sendRemoveUser(socket) {
		this.io.emit(EVENTS.removeUser, socket.id);
  }

  fwdShareSelf(socket, buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
    const replyBuff = msgpack.encode(data.user);
		socket.to(`${data.to}`).emit(EVENTS.addUser, replyBuff);
	}
  
  // Hit

	recvHit(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
		this.game.hit(data);
	}

	sendHit(data) {
    const buffer = msgpack.encode(data);
		this.io.emit(EVENTS.hit, buffer);
	}

  // Key
  
	fwdKeyChange(buffer) {
		this.io.emit(EVENTS.keyChange, buffer);
	}

  // Angle

	fwdAngleChange(buffer) {
		this.io.emit(EVENTS.angleChange, buffer);
	}

  // Fire
  
  recvFire(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
    // TODO: add a bullet to here to track so we can remove it once it hits
    this.sendFire(data);
  }

	sendFire(data) {
    const buffer = msgpack.encode(data.user);
		this.io.emit(EVENTS.fire, buffer);
	}

}

export { ServerSocket }