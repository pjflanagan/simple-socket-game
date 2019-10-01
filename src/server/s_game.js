
import { defaultUserState, GAME_PROPS } from '../helpers'


class Game {
	constructor(socket) {
		this.socket = socket;
    this.users = {};
    this.lasers = {};
	}

	connection(socket, name) {
		const userState = defaultUserState(socket.id, name, this.selectTeam());
		this.users[userState.userID] = {
			score: 0,
			team: userState.team
		};
		this.socket.sendConnection(socket, userState);
	}

	disconnect(socket) {
		if (!!this.users[socket.id]) {
			delete this.users[socket.id];
			this.socket.sendRemoveUser(socket.id);
		}
  }
  
  fire(laser) {
    // this.lasers[laser.userID + laser.position.t] = laser;
    this.socket.sendFire(laser);
  }

	hit(data) {
    // const laser = this.lasers[data.origin.userID + laser.position.t];
    // if(!laser) {
    //   return;
    // }
    // delete this.lasers[laser.userID + laser.position.t];
    const originUser = this.users[data.origin.userID];
    const targetUser = this.users[data.target.userID]
		if (!!originUser && !!targetUser) {
			// calc score
			let pointsAwarded = Math.ceil(targetUser.score / 2);
			data.origin.newScore = (pointsAwarded > 1) ? originUser.score + pointsAwarded : originUser.score + 1;

			// remove the user from here
			delete this.users[data.target.userID];
			this.users[data.origin.userID].score = data.origin.newScore;

			this.socket.sendHit(data);
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