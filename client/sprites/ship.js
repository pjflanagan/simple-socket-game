import { BULLET_PROPS, SHIP_PROPS } from '/shared/index.js';

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
const Ship = function (app, game, data) {
	Phaser.Sprite.call(this, game, data.p.x, data.p.y, 'imgShip');
	this.app = app;
	this.game = game;

	this.state = data;

	this.anchor.set(0.5, 0.5);
	this.angle = data.p.a;

	// this.index = index;
	// var i=index*2;
	this.animations.add('gasOn', [1]);
	this.animations.add('gasOff', [0]);
	this.scale.setTo(.5, .5);

	// enable physics on the Ship
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.body.collideWorldBounds = true;
	this.body.maxVelocity = SHIP_PROPS.velocity;

	// let self = this;
	// this.interval = setInterval(() => {
	// 	self.app.sendStateUpdate();
	// }, 500);

	this.fireable = true;
};

Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {
	let velocity = 0;
	let x = '0', y = '0';

	if (this.state.k.l !== this.state.k.r) {
		x = (this.state.k.l) ? 'W' : 'E';
		velocity = SHIP_PROPS.velocity;
	}

	if (this.state.k.u !== this.state.k.d) {
		y = (this.state.k.u) ? 'N' : 'S';
		velocity = SHIP_PROPS.velocity;
	}

	this.rotation = this.state.p.a;
	this.game.physics.arcade.velocityFromAngle(directionAngles[y + x], velocity, this.body.velocity);
}

Ship.prototype.death = function () {
	// animate
	this.kill();
};

Ship.prototype.shareSelf = function () {
	return {
		i: this.state.i,
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
		k: this.state.k
	};
}

Ship.prototype.recvKeyChange = function (keys) {
	this.state.k = keys;
}

Ship.prototype.recvAngleChange = function (angle) {
	this.state.p.a = angle
}

// Ship.prototype.reload = function () {
// 	var self = this;
// 	this.interval = setTimeout(function () {
// 		self.fireable = true;
// 	}, bulletProps.interval);

// }


export { Ship };