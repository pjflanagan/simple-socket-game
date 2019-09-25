/**
 * @constant
 */

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export const GAME_PROPS = {
	MAX_SHIPS: 30,
	WORLD: {
		WIDTH: 1200, // 3000
		HEIGHT: 1200,
		SAFE_ZONE_WIDTH: 300
	},
	ASTEROIDS: 20,
	TEAM: {
		RED: 0,
		BLUE: 1
	}
};

export const LASER_PROPS = {
	SPEED: 360,
	RELOAD_INTERVAL: 1200,
	LIFESPAN: 1400,
	ROUNDS: 10
};

export const SHIP_PROPS = {
	VELOCITY: 240,
};

export const defaultUserState = function (userID, name, team) {
	const randomSafeZoneWidth = randomInt(20, GAME_PROPS.WORLD.SAFE_ZONE_WIDTH - 120);
	const x = (team === GAME_PROPS.TEAM.RED) ? randomSafeZoneWidth : GAME_PROPS.WORLD.WIDTH - GAME_PROPS.WORLD.SAFE_ZONE_WIDTH + randomSafeZoneWidth;

  // TODO: don't share the obvious defaults
	return {
		userID,
		name,
		team,
		score: 0,
		position: {
			x,
			y: randomInt(200, GAME_PROPS.WORLD.HEIGHT - 200),
			a: 0
		},
		velocity: {
			x: 0,
			y: 0,
		},
		keys: {
			up: false,
			down: false,
			right: false,
			left: false
		}
	};
}
