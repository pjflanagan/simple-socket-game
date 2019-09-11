import { ClientSocket } from './c_socket.js';
import { Ship, Bullet } from './sprites/index.js';
import { GAME } from '../helpers/index.js';

/**
 * @event onload
 */
window.onload = function () {
	let W = $(window).width();
	let H = $(window).height();
	const game = new Phaser.Game(W, H, Phaser.CANVAS, 'game');
	game.state.add('Main', App.Main);
	game.state.start('Main');
};

/**
 * Main program
 */
var App = {};

App.Main = function (game) { }

App.Main.prototype = {

	// overrides

	preload: function () {
		this.game.load.spritesheet(
			'imgShip',
			'/client/assets/img_ship.png',
			100, 100, 2
		);
		this.game.load.spritesheet(
			'imgBullet',
			'/client/assets/img_bullet.png',
			18, 18, 3
		);

		this.game.load.image('bg', '/client/assets/img_bg.png');

		this.user = {
			values: {
				keys: { u: false, d: false, l: false, r: false },
				angle: 0
			},
			handlers: {
				keys: () => this.sendKeyChange(),
				angle: () => this.sendAngleChange(),
			},
			diff: {
				keys: (newKeys) => (
					newKeys.u !== this.user.values.keys.u ||
					newKeys.d !== this.user.values.keys.d ||
					newKeys.l !== this.user.values.keys.l ||
					newKeys.r !== this.user.values.keys.r
				),
				angle: (newAngle) => (
					Math.abs(newAngle - this.user.values.angle) > .15
				)
			},
			mouse: { x: 0, y: 0 },
			set keys(newKeys) {
				if (this.diff.keys(newKeys)) {
					this.values.keys = newKeys;
					this.handlers.keys();
				}
			},
			get keys() {
				return this.values.keys;
			},
			set angle(newAngle) {
				if (this.diff.angle(newAngle)) {
					this.values.angle = newAngle;
					this.handlers.angle();
				}
			},
			get angle() {
				return this.values.angle;
			}
		};
		window.addEventListener("mousemove", (e) => { this.user.mouse.x = e.clientX; this.user.mouse.y = e.clientY; });
		window.addEventListener("mousedown", (e) => { this.handleClick(); })

	},

	create: function () {
		this.game.world.setBounds(0, 0, GAME.WORLD.WIDTH, GAME.WORLD.HEIGHT);
		this.game.add.tileSprite(0, 0, GAME.WORLD.WIDTH, GAME.WORLD.HEIGHT, 'bg');
		this.game.stage.disableVisibilityChange = true; // keep game running if it loses the focus
		this.game.physics.startSystem(Phaser.Physics.ARCADE); // start the Phaser arcade physics engine

		this.BulletGroup = this.game.add.group();
		this.ShipGroup = this.game.add.group();

		this.socket = new ClientSocket(this);

		this.keyLeft = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
		this.keyRight = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
		this.keyUp = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
		this.keyDown = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
	},

	update: function () {
		this.ShipGroup.forEach(function (ship) {
			ship.update();
		});
		this.userInput();
	},

	// input

	userInput: function () {
		if (!this.self) return;

		this.user.keys = {
			r: this.keyRight.isDown,
			l: this.keyLeft.isDown,
			u: this.keyUp.isDown,
			d: this.keyDown.isDown
		};


		const dx = (this.self.body.x + this.self.body.halfWidth) - this.game.camera.x - this.user.mouse.x;
		const dy = (this.self.body.y + this.self.body.halfHeight) - this.game.camera.y - this.user.mouse.y;
		this.user.angle = Math.atan2(dy, dx) - Math.PI / 4;
	},

	handleClick: function () {
		// if (!this.fireable)
		// 	return;
		this.fireable = false;
		// this.reload();

		let x = this.self.body.x + this.self.body.halfWidth;
		let y = this.self.body.y + this.self.body.halfHeight;
		this.socket.sendFire({
			i: this.self.state.i,
			p: {
				x: x,
				y: y,
				a: this.user.angle - 3 * Math.PI / 4
			}
		});
	},

	// socket functions

	addSelf: function (data) {
		this.self = new Ship(this, this.game, data);
		this.ShipGroup.add(this.self);
		this.game.camera.follow(this.self);
	},

	shareSelf: function () {
		return this.self.shareSelf();
	},

	addUser: function (data) {
		this.ShipGroup.add(new Ship(this, this.game, data));
	},

	removeUser: function (userID) {
		this.ShipGroup.forEach((ship) => {
			if (ship.state.i === userID)
				ship.death();
		});
	},

	sendKeyChange: function () {
		this.socket.sendKeyChange({
			i: this.self.state.i,
			k: this.user.keys
		});
	},

	recvKeyChange: function (data) {
		this.ShipGroup.forEach(function (ship) {
			if (ship.state.i === data.i) {
				ship.recvKeyChange(data.k);
			}
		});
	},

	sendAngleChange: function () {
		this.socket.sendAngleChange({
			i: this.self.state.i,
			a: this.user.angle
		})
	},

	recvAngleChange: function (data) {
		this.ShipGroup.forEach(function (ship) {
			if (ship.state.i === data.i) {
				ship.recvAngleChange(data.a);
			}
		});
	},

	// sendStateUpdate: function () {
	// 	this.socket.sendStateUpdate(this.self.getState());
	// },

	recvStateUpdate: function (data) {
		this.ShipGroup.forEach(function (ship) {
			if (ship.state.i === data.i) {
				ship.recvStateUpdate(data);
			}
		})
	},

	sendFire: function (data) {
		this.socket.sendFire(data);
	},

	recvFire: function (data) {
		this.BulletGroup.add(new Bullet(this, this.game, data));
	}

};