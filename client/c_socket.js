import { EVENTS } from '/helpers/index.js';

class ClientSocket {
	constructor(app) {
		this.socket = io();
		this.app = app;
		const self = this;

		this.socket.on(EVENTS.addSelf, (data) => self.addSelf(data));
		this.socket.on(EVENTS.addUser, (data) => self.addUser(data))
		this.socket.on(EVENTS.addNewUser, (data) => {
			self.addUser(data);
			self.shareSelf(data);
		});

		this.socket.on(EVENTS.death, (data) => self.removeUser(data));
		this.socket.on(EVENTS.keyChange, (data) => self.recvKeyChange(data));
		this.socket.on(EVENTS.angleChange, (data) => self.recvAngleChange(data));
		this.socket.on(EVENTS.stateUpdate, (data) => self.recvStateUpdate(data));
		this.socket.on(EVENTS.fire, (data) => self.recvFire(data));
	}

	addSelf(data) {
		this.app.addSelf(data);
	}

	addUser(data) {
		this.app.addUser(data);
	}

	removeUser(userID) {
		// right now data is just the user id but 
		// it should also have who killed them to keep score
		this.app.removeUser(userID);
	}

	shareSelf(data) {
		this.socket.emit(EVENTS.shareSelf, {
			to: data.i,
			user: this.app.shareSelf()
		});
	}

	sendKeyChange(data) {
		this.socket.emit(EVENTS.keyChange, data);
	}

	recvKeyChange(data) {
		this.app.recvKeyChange(data);
	}

	sendAngleChange(data) {
		this.socket.emit(EVENTS.angleChange, data);
	}

	recvAngleChange(data) {
		this.app.recvAngleChange(data);
	}

	sendStateUpdate(data) {
		this.socket.emit(EVENTS.stateUpdate, data);
	}

	recvStateUpdate(data) {
		this.app.recvStateUpdate(data);
	}

	sendFire(data) {
		this.socket.emit(EVENTS.fire, data);
	}

	recvFire(data) {
		this.app.recvFire(data);
	}

}

export { ClientSocket };