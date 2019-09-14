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

		this.socket.on(EVENTS.addSelf, (data) => self.recvAddSelf(data));
		this.socket.on(EVENTS.addUser, (data) => self.recvAddUser(data))
		this.socket.on(EVENTS.addNewUser, (data) => {
			self.recvAddUser(data);
			self.sendShareSelf(data);
		});
		this.socket.on(EVENTS.removeUser, (data) => self.recvRemoveUser(data));

		this.socket.on(EVENTS.keyChange, (data) => self.recvKeyChange(data));
		this.socket.on(EVENTS.angleChange, (data) => self.recvAngleChange(data));
		this.socket.on(EVENTS.stateUpdate, (data) => self.recvStateUpdate(data));
		this.socket.on(EVENTS.fire, (data) => self.recvFire(data));
		this.socket.on(EVENTS.hit, (data) => self.recvLaserHit(data));
	}

	//

	recvAddSelf(data) {
		this.app.recvAddSelf(data);
	}

	recvAddUser(data) {
		this.app.recvAddUser(data);
	}

	recvRemoveUser(userID) {
		this.app.recvRemoveUser(userID);
	}

	sendShareSelf(data) {
		// if(!this.app.isAlive()) return;
		this.socket.emit(EVENTS.shareSelf, {
			to: data.i,
			user: this.app.getUserState()
		});
	}

	//

	sendKeyChange(data) {
		this.socket.emit(EVENTS.keyChange, data);
	}

	recvKeyChange(data) {
		this.app.recvKeyChange(data);
	}

	//

	sendAngleChange(data) {
		this.socket.emit(EVENTS.angleChange, data);
	}

	recvAngleChange(data) {
		this.app.recvAngleChange(data);
	}

	//

	// sendStateUpdate(data) {
	// 	this.socket.emit(EVENTS.stateUpdate, data);
	// }

	// recvStateUpdate(data) {
	// 	this.app.recvStateUpdate(data);
	// }

	//

	sendFire(data) {
		this.socket.emit(EVENTS.fire, data);
	}

	recvFire(data) {
		this.app.recvFire(data);
	}

	//

	sendLaserHit(data) {
		this.socket.emit(EVENTS.hit, data);
	}

	recvLaserHit(data) {
		this.app.recvLaserHit(data);
	}

}

export { ClientSocket };