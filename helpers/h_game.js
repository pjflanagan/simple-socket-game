/**
 * @constant
 */

export const GAME = {
	MAX_SHIPS: 30,
	WORLD: {
		WIDTH: 2000,
		HEIGHT: 2000
	},
	ASTEROIDS: 20,
	TEAM: {
		RED: 0,
		BLUE: 1
	}
};

export const LASER_PROPS = {
	speed: 360,
	interval: 420,
	lifespan: 1000,
};

export const SHIP_PROPS = {
	velocity: 240,
};

export const defaultUserState = function (userID, team) {
	return {
		i: userID, // id
		t: team,
		p: { // position
			x: Math.floor(Math.random() * GAME.WORLD.WIDTH),
			y: Math.floor(Math.random() * GAME.WORLD.HEIGHT),
			a: Math.random() * 180 // angle
		},
		v: { // velocity
			x: 0,
			y: 0,
		},
		h: 100, // health
		k: { // keys
			u: false, // up
			l: false, // left
			r: false, // right
			d: false
		}
	};
}
