import { EVENTS, encode, decode } from '../helpers/index.js';
import io from 'socket.io-client';

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
    const data = decode(EVENTS.addSelf, buffer);
		this.app.recvAddSelf(data);
	}

	recvAddUser(buffer) {
    const data = decode(EVENTS.addUser, buffer);
		this.app.recvAddUser(data);
  }

  recvRemoveUser(userID) {
		this.app.recvRemoveUser(userID);
  }

  recvAddNewUser(buffer) {
    const data = decode(EVENTS.addNewUser, buffer);
    this.app.recvAddUser(data);
		this.sendShareSelf(data.userID);
  }

	sendShareSelf(toUserID) {
    // if(!this.app.isAlive()) return;
    
    const buffer = encode({
			to: toUserID,
			user: this.app.getUserState()
		});
		this.socket.emit(EVENTS.shareSelf, buffer);
	}

	// Key

	sendKeyChange(data) {
    const buffer = encode(data);
		this.socket.emit(EVENTS.keyChange, buffer);
	}

	recvKeyChange(buffer) {
    const data = decode(EVENTS.keyChange, buffer); // NOTE: either new Uint8Array(buffer) or buffer.data
		this.app.recvKeyChange(data);
	}

	// Angle

	sendAngleChange(data) {
    const buffer = encode(EVENTS.angleChange, data);
		this.socket.emit(EVENTS.angleChange, buffer);
	}

	recvAngleChange(buffer) {
    const data = decode(EVENTS.angleChange, buffer);
		this.app.recvAngleChange(data);
	}

	// Laser

	sendFire(data) {
    const buffer = encode(EVENTS.fire, data);
		this.socket.emit(EVENTS.fire, buffer);
	}

	recvFire(buffer) {
    const data = decode(EVENTS.fire, buffer);
		this.app.recvFire(data);
	}

	// Hit

	sendLaserHit(data) {
    const buffer = encode(EVENTS.hit, data);
		this.socket.emit(EVENTS.hit, buffer);
	}

	recvLaserHit(buffer) {
    const data = decode(EVENTS.hit, buffer);
		this.app.recvLaserHit(data);
	}

}

export { ClientSocket };