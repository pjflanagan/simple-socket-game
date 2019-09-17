import { EVENTS } from '/helpers/index.js';

class ClientSocket {
	constructor(app) {
		const name = gup('name') || '';
		this.socket = io({
			query: {
				name
			}
		});
		this.app = app;
    const self = this;

		this.socket.on(EVENTS.addSelf, (buffer) => self.recvAddSelf(buffer));
		this.socket.on(EVENTS.addUser, (buffer) => self.recvAddUser(buffer));
    this.socket.on(EVENTS.addNewUser, (buffer) => self.recvAddNewUser(buffer));
		this.socket.on(EVENTS.removeUser, (userID) => self.recvRemoveUser(userID));

		this.socket.on(EVENTS.keyChange, (buffer) => self.recvKeyChange(buffer));
		this.socket.on(EVENTS.angleChange, (buffer) => self.recvAngleChange(buffer));
		this.socket.on(EVENTS.fire, (buffer) => self.recvFire(buffer));
		this.socket.on(EVENTS.hit, (buffer) => self.recvLaserHit(buffer));
  }

	// Admin

	recvAddSelf(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
		this.app.recvAddSelf(data);
	}

	recvAddUser(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
		this.app.recvAddUser(data);
  }

  recvRemoveUser(userID) {
		this.app.recvRemoveUser(userID);
  }

  recvAddNewUser(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
    this.app.recvAddUser(data);
		this.sendShareSelf(data.i);
  }

	sendShareSelf(userID) {
		// if(!this.app.isAlive()) return;
    const buffer = msgpack.encode({
			to: userID,
			user: this.app.getUserState()
		});
		this.socket.emit(EVENTS.shareSelf, buffer);
	}

	// Key

	sendKeyChange(data) {
    const buffer = msgpack.encode(data);
		this.socket.emit(EVENTS.keyChange, buffer);
	}

	recvKeyChange(buffer) {
    const data = msgpack.decode(buffer.data);
		this.app.recvKeyChange(data);
	}

	// Angle

	sendAngleChange(data) {
    const buffer = msgpack.encode(data);
		this.socket.emit(EVENTS.angleChange, buffer);
	}

	recvAngleChange(buffer) {
    const data = msgpack.decode(buffer.data);
		this.app.recvAngleChange(data);
	}

	// Laser

	sendFire(data) {
    const buffer = msgpack.encode(data);
		this.socket.emit(EVENTS.fire, buffer);
	}

	recvFire(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
		this.app.recvFire(data);
	}

	// Hit

	sendLaserHit(data) {
    const buffer = msgpack.encode(data);
		this.socket.emit(EVENTS.hit, buffer);
	}

	recvLaserHit(buffer) {
    const data = msgpack.decode(new Uint8Array(buffer));
		this.app.recvLaserHit(data);
	}

}

export { ClientSocket };