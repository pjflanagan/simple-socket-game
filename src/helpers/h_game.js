/**
 * @constant
 */

export const MATH = {
  distance: function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  },
  radians: function (degrees) {
    return degrees * Math.PI / 180; // Converts from degrees to radians
  },
  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
};

MATH.extrapolate = function(originalPosition, objectMaxVelocity) {
  const dt = (new Date().getTime() - originalPosition.t ) / 1000;
  const dv = dt * objectMaxVelocity;
  const realPosition = {
    x: Math.cos(originalPosition.a) * dv + originalPosition.x,
    y: Math.sin(originalPosition.a) * dv + originalPosition.y,
    a: originalPosition.a
  }
  return {
    distanceTraveled: MATH.distance(originalPosition, realPosition),
    realPosition
  };
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
	DIAMETER: 100
};

export const defaultUserState = function (userID, name, team) {
	const randomSafeZoneWidth = MATH.randomInt(SHIP_PROPS.DIAMETER, GAME_PROPS.WORLD.SAFE_ZONE_WIDTH - SHIP_PROPS.DIAMETER);
	const x = (team === GAME_PROPS.TEAM.RED) ?
		randomSafeZoneWidth :
		GAME_PROPS.WORLD.WIDTH - GAME_PROPS.WORLD.SAFE_ZONE_WIDTH + randomSafeZoneWidth;

	return {
		userID,
		name,
		team,
		score: 0,
		position: {
			x,
			y: MATH.randomInt(2 * SHIP_PROPS.DIAMETER, GAME_PROPS.WORLD.HEIGHT - (2 * SHIP_PROPS.DIAMETER)),
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