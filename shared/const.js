/**
 * @constant
 */
const DIMS = {
	W: 1800,
	H: 1200
};
const STATE = {
	INIT: 0,
	START: 1,
	PLAY: 2,
	GAMEOVER: 3
};
const GAME = {
	STONES: ["POWER", "SPACE", "REALITY", "SOUL", "TIME", "MIND"],
	MAX_SHIPS: 30,
	WORLD: {
		WIDTH: 1000,
		HEIGHT: 1000
	}
};
const ACTIONS = {
	CONNECT: 'connection'
}

const defaultUserState = function (userID) {
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
			r: false // right
		}
	};
}

export { defaultUserState, GAME };