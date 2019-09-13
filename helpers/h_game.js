/**
 * @constant
 */

export const GAME = {
	MAX_SHIPS: 30,
	WORLD: {
		WIDTH: 2000,
    HEIGHT: 1200,
    SAFE_ZONE_WIDTH: 200
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
  LIFESPAN: 1000,
  ROUNDS: 3
};

export const SHIP_PROPS = {
	VELOCITY: 240,
};

export const defaultUserState = function (userID, name, team) {
  const randomSafeZoneWidth = Math.floor(Math.random() * GAME.WORLD.SAFE_ZONE_WIDTH);
  const x = (team === GAME.TEAM.RED) ? randomSafeZoneWidth : GAME.WORLD.WIDTH + randomSafeZoneWidth;

	return {
    i: userID, // id
    n: name,
    t: team,
    s: 0,
		p: { // position
			x,
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
