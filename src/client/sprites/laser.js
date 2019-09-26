import { LASER_PROPS, GAME_PROPS } from '../../helpers/index.js';
// import Phaser from 'phaser'; TODO: upgrade to Phaser 3 or use Phaser 2 in node_modules

/**
 * @class Laser @extends Phaser.Sprite
 */
var Laser = function (app, game, data) {
	const image = (data.team === GAME_PROPS.TEAM.RED) ? 'imgRedLaser' : 'imgBlueLaser';
	Phaser.Sprite.call(this, game, data.position.x, data.position.y, image);
	this.app = app;
	this.userID = data.userID;
	this.team = data.team;

	this.anchor.set(.5, .5);
	this.lifespan = LASER_PROPS.LIFESPAN;
	this.reset(data.position.x, data.position.y);

	this.animations.add('fire', [0, 1, 2]);
	this.animations.play('fire', 8, true);
  this.scale.setTo(.25, .25);
  this.angle = data.position.a;

	// enable physics on the laser
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.game.physics.arcade.velocityFromRotation(this.angle, LASER_PROPS.SPEED, this.body.velocity);
};

Laser.prototype = Object.create(Phaser.Sprite.prototype);
Laser.prototype.constructor = Laser;

// TODO: ???
Laser.prototype.hit = function () {
	// sendHit
	this.kill();
	this.app.removeLaser(this);
}

export { Laser };