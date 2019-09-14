
const EXPLOSION_PROPS = {
	lifespan: () => (Math.random() * .5 + .5) * 500,
	speed: () => (Math.random() * .5 + .5) * 360,
	angle: () => Math.random() * Math.PI * 2,
	count: () => Math.floor(Math.random() * 20) + 10
}

/**
 * @class Debris @extends Phaser.Sprite
 */
const Debris = function (game, data) {
	Phaser.Sprite.call(this, game, data.p.x, data.p.y, 'imgDebris');

	this.anchor.set(.5, .5);
	this.lifespan = EXPLOSION_PROPS.lifespan();
	this.reset(data.p.x, data.p.y);

	this.animations.add('fire', [0, 1, 2]);
	this.animations.play('fire', 8, true);
	this.scale.setTo(.25, .25);

	// enable physics on the laser
	game.physics.enable(this, Phaser.Physics.ARCADE);
	const speed = EXPLOSION_PROPS.speed();
	const angle = EXPLOSION_PROPS.angle();
	game.physics.arcade.velocityFromRotation(angle, speed, this.body.velocity);
};

Debris.prototype = Object.create(Phaser.Sprite.prototype);
Debris.prototype.constructor = Debris;

export const explosion = function (game, data) {
	const DebrisGroup = game.add.group();
	const count = EXPLOSION_PROPS.count();
	for (let i = 0; i < count; ++i) {
		DebrisGroup.add(new Debris(game, data));
	}
};