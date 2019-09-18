
import { defaultUserState, GAME } from '../helpers'


class Game {
	constructor(server) {
		this.server = server;
		this.users = {};
	}

	connection(socket, name) {
		const userState = defaultUserState(socket.id, name, this.selectTeam());
		this.users[userState.i] = {
			score: 0,
			team: userState.t
		};
		this.server.sendConnection(socket, userState);
	}

	disconnect(socket) {
		if (!!this.users[socket.id]) {
			delete this.users[socket.id];
			this.server.sendRemoveUser(socket);
		}
	}

	hit(data) {
		if (!!this.users[data.target.userID]) {
			// calc score
			let score = Math.floor(this.users[data.target.userID].score / 2);
			data.origin.score = (score > 1) ? score : 1;

			// remove the user from here
			delete this.users[data.target.userID]; // TODO: maybe should send the client and wait for a response to know they died

			// reward the player
			if (!!this.users[data.origin.userID]) {
				this.users[data.origin.userID].score += data.origin.score;
			}

			this.server.sendHit(data);

		}
	}

	selectTeam() {
		let blue = 0;
		let red = 0;
		for (const [key, value] of Object.entries(this.users)) {
			if (value.team === GAME.TEAM.RED) {
				++red;
			} else {
				++blue;
			}
		};
		return (red <= blue) ? GAME.TEAM.RED : GAME.TEAM.BLUE;
	}
}

export { Game };