/**
 * @constant
 */

export const GAME = {
	MAX_SHIPS: 30,
	WORLD: {
		WIDTH: 1000,
		HEIGHT: 1000
	},
	ASTEROIDS: 20,
	TEAM: {
		RED: 1,
		BLUE: 2
	}
};

export const BULLET_PROPS = {
	speed: 360,
	interval: 420,
	lifespan: 1000,
};

export const SHIP_PROPS = {
	velocity: 240
};

export const defaultUserState = function (userID, team) {
	return {
		i: userID, // id
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
