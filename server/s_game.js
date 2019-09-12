
import { defaultUserState, GAME } from '../helpers'

class Game {
	constructor(server) {
		this.server = server;
    this.users = {};
	}

	connection(socket) {
		const userState = defaultUserState(socket.id, this.selectTeam());
    this.users[userState.i] = userState;
		this.server.sendConnection(socket, userState);
	}

	disconnect(socket) {
    delete this.users[socket.id];
		this.server.sendDisconnect(socket);
	}

	// updateState(data) {
	// 	this.userState[data.id] = data;
	// }

	// reportState() {
	// 	this.server.reportState(this.userStates);
	// }

	selectTeam() {
    let blue = 0;
    let red = 0;
    for (const [key, value] of Object.entries(this.users)) {
      if (value.t === GAME.TEAM.RED) {
        ++red;
      } else {
        ++blue;
      }
    };
		return (red <= blue) ? GAME.TEAM.RED : GAME.TEAM.BLUE;
	}
}

export { Game };