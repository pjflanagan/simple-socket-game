import { SHIP_PROPS, GAME } from '/helpers/index.js';
import { explosion } from './explosion.js';

Math.radians = function (degrees) {
	return degrees * Math.PI / 180; // Converts from degrees to radians
};

const ff = 45;
const directionAngles = {
	"0W": -ff * 4,
	"NW": -ff * 3,
	"N0": -ff * 2,
	"NE": -ff,
	"0E": 0,
	"SE": ff,
	"S0": ff * 2,
	"SW": ff * 3,
	"00": 0
}

/**
 * @class Ship @extends Phaser.Sprite
 */
const Ship = function (app, game, data, isSelf = false) {
	Phaser.Sprite.call(this, game, data.p.x, data.p.y, 'imgShip');
	this.app = app;
	this.game = game;

	this.userID = data.i;
	this.name = data.n;
	this.keys = data.k;
	this.team = data.t;
	this.angle = data.p.a;
	this.score = data.s;
	this.isSelf = isSelf;

	this.anchor.set(0.5, 0.5);

	if (this.team === GAME.TEAM.RED) {
		this.animations.add('red', [0]);
		this.animations.play('red');
	} else {
		this.animations.add('blue', [1]);
		this.animations.play('blue');
	}
	this.scale.setTo(.5, .5);

	// enable physics on the Ship
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.body.collideWorldBounds = true;
	this.body.maxVelocity = SHIP_PROPS.VELOCITY;

	if (this.shouldDisplayText()) {
		const style = {
			font: "12px Roboto Mono",
			fill: "#FFF",
			wordWrap: true,
			wordWrapWidth: this.width * 1.4,
			align: "center",
		};
		this.text = game.add.text(0, 0, this.name, style);
		this.text.anchor.set(0.5);
	}
};

Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {
	let velocity = 0;
	let x = '0', y = '0';

	if (this.keys.l !== this.keys.r) {
		x = (this.keys.l) ? 'W' : 'E';
		velocity = SHIP_PROPS.VELOCITY;
	}

	if (this.keys.u !== this.keys.d) {
		y = (this.keys.u) ? 'N' : 'S';
		velocity = SHIP_PROPS.VELOCITY;
	}

	this.game.physics.arcade.velocityFromAngle(directionAngles[y + x], velocity, this.body.velocity);

	if (!!this.text) {
		this.text.x = Math.floor(this.x);
		this.text.y = Math.floor(this.y + this.height);
	}
}

Ship.prototype.death = function () {
	if (!!this.text) {
		this.text.kill();
	}
	explosion(this.game, {
		p: {
			x: this.x,
			y: this.y,
		}
	})
	this.kill();
	this.app.removeShip(this);
};

Ship.prototype.getState = function () {
	return {
		i: this.userID,
		n: this.name,
		t: this.team,
		s: this.score,
		p: {
			x: this.x,
			y: this.y,
			a: this.angle
		},
		v: { // velocity
			x: this.body.velocity.x,
			y: this.body.velocity.y,
		},
		h: 100, // health this.health (Health is a Phaser property)
		k: this.keys
	};
}

Ship.prototype.keyChange = function (keys) {
	this.keys = keys;
}

Ship.prototype.angleChange = function (angle) {
	this.rotation = angle;
}

// TODO: points should be a sum of kill count, the time it's been alive for, and the asteroids taken
Ship.prototype.rewardPoints = function ({ s }) {
	this.score += s;
}

Ship.prototype.shouldDisplayText = function () {
	return !this.isSelf && this.team === this.app.getTeam()
}

export { Ship };