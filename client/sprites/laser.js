import { LASER_PROPS, GAME } from '/helpers/index.js';

/**
 * @class Laser @extends PHaser.Sprite
 */
var Laser = function (app, game, data) {
	const image = (data.t === GAME.TEAM.RED) ? 'imgRedLaser' : 'imgBlueLaser';
	Phaser.Sprite.call(this, game, data.p.x, data.p.y, image);
	this.app = app;
	this.userID = data.i;
	this.team = data.t;

	this.anchor.set(.5, .5);
	this.lifespan = LASER_PROPS.LIFESPAN;
	this.reset(data.p.x, data.p.y);

	this.animations.add('fire', [0, 1, 2]);
	this.animations.play('fire', 8, true);
	this.scale.setTo(.25, .25);

	// enable physics on the laser
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.game.physics.arcade.velocityFromRotation(data.p.a, LASER_PROPS.SPEED, this.body.velocity);
};

Laser.prototype = Object.create(Phaser.Sprite.prototype);
Laser.prototype.constructor = Laser;

Laser.prototype.hit = function () {
	// sendHit
  this.kill();
  this.app.removeLaser(this);
}

export { Laser };