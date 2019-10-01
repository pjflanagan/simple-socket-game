import { SHIP_PROPS, GAME_PROPS, MATH } from '../../helpers/index.js';
import { explosion } from './explosion.js';
// import Phaser from 'phaser';

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

/** ----------------------------------------------------------------------------
 * @class To @extends Phaser.Sprite
 */
const ToSprite = function (app, game, data, player) {
	Phaser.Sprite.call(this, game, data.position.x, data.position.y); // TODO: Phaser 3 Phaser.GameObjects.Sprite
	this.app = app;
	this.game = game;
	this.player = player;

	this.anchor.set(0.5, 0.5);
	this.scale.set(0.5, 0.5);

	// enable physics on the Ship
	this.game.physics.enable(this, Phaser.Physics.ARCADE);
	this.body.collideWorldBounds = true;
	this.body.maxVelocity = SHIP_PROPS.VELOCITY;

	this.keys = data.keys;
}

ToSprite.prototype = Object.create(Phaser.Sprite.prototype);
ToSprite.prototype.constructor = ToSprite;

ToSprite.prototype.update = function () {
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
}

ToSprite.prototype.keyChange = function ({ to, keys }) {
	this.x = to.x;
	this.y = to.y;
	this.keys = keys;
}

/** ----------------------------------------------------------------------------
 * @class ShipSprite @extends Phaser.Sprite
 */
const ShipSprite = function (app, game, data, player) {
	Phaser.Sprite.call(this, game, data.position.x, data.position.y, 'imgShip'); // TODO: Phaser 3 Phaser.GameObjects.Sprite
	this.app = app;
	this.game = game;
	this.player = player;
	this.score = this.player.score;

	this.anchor.set(0.5, 0.5);

	if (this.player.team === GAME_PROPS.TEAM.RED) {
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

	if (this.player.shouldDisplayText()) {
		const style = {
			font: "12px Roboto Mono",
			fill: "#FFF",
			wordWrap: true,
			wordWrapWidth: this.width * 1.4,
			align: "center",
		};
		this.text = game.add.text(0, 0, this.player.name, style);
		this.text.anchor.set(0.5);
	}
};

ShipSprite.prototype = Object.create(Phaser.Sprite.prototype);
ShipSprite.prototype.constructor = ShipSprite;

ShipSprite.prototype.update = function () {
	if (MATH.distance(this, this.player.to) < 5) {
		this.body.velocity.setTo(0, 0);
	} else {
		this.game.physics.arcade.moveToObject(this, this.player.to, SHIP_PROPS.VELOCITY - 20); // TODO: velocity increases with distance
	}

	if (!!this.text) {
		this.text.x = Math.floor(this.x);
		this.text.y = Math.floor(this.y + this.height);
	}
}

ShipSprite.prototype.death = function (angle) {
	if (!!this.text) {
		this.text.kill();
	}
	explosion(this.game, {
		x: this.x,
		y: this.y,
		a: angle
	});
	this.kill();
};

ShipSprite.prototype.angleChange = function (angle) {
	this.rotation = angle;
}

/** ----------------------------------------------------------------------------
 * @class Ship
 */
export class Ship {
	constructor(app, game, data, isSelf = false) {
		this.app = app;
		this.game = game;

		this.userID = data.userID;
		this.name = data.name;
		this.team = data.team;
		this.score = data.score;
		this.isSelf = isSelf;

		this.ship = new ShipSprite(app, game, data, this);
		this.app.ShipGroup.add(this.ship);

		this.to = new ToSprite(app, game, data, this);
		this.app.ToGroup.add(this.to);
	}

	update() {
		this.to.update();
		this.ship.update();
	}

	keyChange({ to, keys }) {
		this.to.keyChange({ to, keys });
		this.ship.update();
	}

	rewardPoints(newScore) {
		this.score = newScore;
		this.ship.score = newScore;
	}

	angleChange(angle) {
		this.ship.angleChange(angle);
	}

	death() {
		this.to.kill();
		this.ship.death();
		this.app.removeShip(this);
	}

	shouldDisplayText() {
		return !this.isSelf && this.team === this.app.getTeam()
	}

	getBody() {
		return this.ship.body;
	}

	getTo() {
		return {
			x: this.to.x,
			y: this.to.y
		};
	}

	getPosition() {
		return {
			x: this.ship.x,
			y: this.ship.y,
			a: this.ship.angle
		};
	}

	getState() {
		return {
			userID: this.userID,
			name: this.name,
			team: this.team,
			score: this.score,
			position: {
				x: this.ship.x,
				y: this.ship.y,
				a: this.ship.angle
			},
			// to: {
			// 	x: this.to.x,
			// 	y: this.to.y
			// },
			velocity: {
				x: this.to.body.velocity.x,
				y: this.to.body.velocity.y,
			},
			keys: this.to.keys
		};
	}
}