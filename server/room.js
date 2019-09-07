
import { defaultUserState } from '../shared/const.js'

class Room {
	constructor(server) {
		this.server = server;
		this.users = []; // in order by host
	}

	// size - size of room
	// high scores - high scores of the room

	connection(socket) {
		const userState = defaultUserState(socket.id);
		this.users[userState.i] = userState;
		this.server.sendConnection(socket, userState);
	}

	disconnect(socket) {
		delete this.users[socket.id]
		this.server.sendDisconnect(socket);
	}

	// updateState(data) {
	// 	this.userState[data.id] = data;
	// }

	// reportState() {
	// 	this.server.reportState(this.userStates);
	// }
}

export { Room };