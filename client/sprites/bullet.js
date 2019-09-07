
const bulletProps = {
	speed: 600,
	interval: 420,
	lifespan: 600,
	maxCount: 90,
};

/**
 * @class Bullet @extends PHaser.Sprite
 */
var Bullet = function (app, game, data) {
	Phaser.Sprite.call(this, game, data.p.x, data.p.y, 'imgBullet');
	this.app = app;
	this.userID = data.i;

	this.anchor.set(.5, .5);
	this.lifespan = bulletProps.lifespan;
	this.reset(data.p.x, data.p.y);

	this.animations.add('fire', [0, 1, 2]);
	this.animations.play('fire', 8, true);
	this.scale.setTo(.25, .25);

	// enable physics on the bullet
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.game.physics.arcade.velocityFromRotation(data.p.a, bulletProps.speed, this.body.velocity);
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.hit = function () {
	// sendHit
	this.kill();
}

export { Bullet, bulletProps };