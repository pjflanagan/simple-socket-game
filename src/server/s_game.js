
import { defaultUserState, GAME_PROPS } from '../helpers'


class Game {
	constructor(server) {
		this.server = server;
		this.users = {};
	}

	connection(socket, name) {
		const userState = defaultUserState(socket.id, name, this.selectTeam());
		this.users[userState.userID] = {
			score: 0,
			team: userState.team
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
			let pointsAwarded = Math.floor(this.users[data.target.userID].score / 2);
			data.origin.pointsAwarded = (pointsAwarded > 1) ? pointsAwarded : 1;

			// remove the user from here
			delete this.users[data.target.userID]; // TODO: maybe should send the client and wait for a response to know they died

			// reward the player
			if (!!this.users[data.origin.userID]) {
				this.users[data.origin.userID].score += data.origin.pointsAwarded;
			}

			this.server.sendHit(data);
		}
	}

	selectTeam() {
		let blue = 0;
		let red = 0;
		for (const [key, value] of Object.entries(this.users)) {
			if (value.team === GAME_PROPS.TEAM.RED) {
				++red;
			} else {
				++blue;
			}
		};
		return (red <= blue) ? GAME_PROPS.TEAM.RED : GAME_PROPS.TEAM.BLUE;
	}
}

export { Game };