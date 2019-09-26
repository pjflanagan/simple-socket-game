import { SHIP_PROPS, GAME_PROPS } from '../../helpers/index.js';
import { explosion } from './explosion.js';
// import Phaser from 'phaser';

Math.radians = function (degrees) {
	return degrees * Math.PI / 180; // Converts from degrees to radians
};

const FOURTY_FIVE = 45;
const directionAngles = {
	"0W": -FOURTY_FIVE * 4,
	"NW": -FOURTY_FIVE * 3,
	"N0": -FOURTY_FIVE * 2,
	"NE": -FOURTY_FIVE,
	"0E": 0,
	"SE": FOURTY_FIVE,
	"S0": FOURTY_FIVE * 2,
	"SW": FOURTY_FIVE * 3,
	"00": 0
}

/**
 * @class Ship @extends Phaser.Sprite
 */
const Ship = function (app, game, data, isSelf = false) {
	Phaser.Sprite.call(this, game, data.position.x, data.position.y, 'imgShip'); // TODO: Phaser 3 Phaser.GameObjects.Sprite
	this.app = app;
	this.game = game;

	this.userID = data.userID;
	this.name = data.name;
	this.keys = data.keys;
	this.team = data.team;
	this.angle = data.position.a;
	this.score = data.score;
	this.isSelf = isSelf;

	this.anchor.set(0.5, 0.5);

	if (this.team === GAME_PROPS.TEAM.RED) {
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

	if (this.keys.left !== this.keys.right) {
		x = (this.keys.left) ? 'W' : 'E';
		velocity = SHIP_PROPS.VELOCITY;
	}

	if (this.keys.up !== this.keys.down) {
		y = (this.keys.up) ? 'N' : 'S';
		velocity = SHIP_PROPS.VELOCITY;
	}

	this.game.physics.arcade.velocityFromAngle(directionAngles[y + x], velocity, this.body.velocity);

	if (!!this.text) {
		this.text.x = Math.floor(this.x);
		this.text.y = Math.floor(this.y + this.height);
	}
}

Ship.prototype.death = function (angle) {
	if (!!this.text) {
		this.text.kill();
	}
	explosion(this.game, {
		x: this.x,
    y: this.y,
    a: angle
	})
	this.kill();
	this.app.removeShip(this);
};

Ship.prototype.getState = function () {
	return {
		userID: this.userID,
		name: this.name,
		team: this.team,
		score: this.score,
		position: {
			x: this.x,
			y: this.y,
			a: this.angle
		},
		velocity: {
			x: this.body.velocity.x,
			y: this.body.velocity.y,
		},
		keys: this.keys
	};
}

Ship.prototype.keyChange = function (keys) {
	this.keys = keys;
}

Ship.prototype.angleChange = function (angle) {
	this.rotation = angle;
}

// TODO: points should be a sum of kill count, the time it's been alive for, and the asteroids taken
Ship.prototype.rewardPoints = function (pointsAwarded) {
	this.score += pointsAwarded;
}

Ship.prototype.shouldDisplayText = function () {
	return !this.isSelf && this.team === this.app.getTeam()
}

export { Ship };