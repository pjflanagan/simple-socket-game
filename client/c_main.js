import { ClientSocket } from './c_socket.js';
import { Ship, Laser } from './sprites/index.js';
import { GAME } from '../helpers/index.js';
import { Player } from './c_player.js';

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
			'imgRedLaser',
			'/client/assets/img_red_laser.png',
			16, 16, 3
		);
		this.game.load.spritesheet(
			'imgBlueLaser',
			'/client/assets/img_blue_laser.png',
			16, 16, 3
		);

		this.game.load.image('bg', '/client/assets/img_bg.png');

    this.player = new Player(this);
	},

	create: function () {
		this.game.world.setBounds(0, 0, GAME.WORLD.WIDTH, GAME.WORLD.HEIGHT);
		this.game.add.tileSprite(0, 0, GAME.WORLD.WIDTH, GAME.WORLD.HEIGHT, 'bg');
		this.game.stage.disableVisibilityChange = true; // keep game running if it loses the focus
		this.game.physics.startSystem(Phaser.Physics.ARCADE); // start the Phaser arcade physics engine

		this.LaserGroup = this.game.add.group();
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
		this.player.input(this.self, this.game, {
			r: this.keyRight.isDown,
			l: this.keyLeft.isDown,
			u: this.keyUp.isDown,
			d: this.keyDown.isDown
		});
		this.game.physics.arcade.overlap(this.LaserGroup, this.self, this.laserHit, null, this);
	},

	// GAME FUNCTIONS

  laserHit: function (laser, self) {
		if (!this.player.hasBeenHit && laser.team !== self.team) {
      this.player.hasBeenHit = true;
      this.sendLaserHit(laser);
		}
	},

  // SOCKET FUNCTIONS

  recvAddSelf: function (data) {
		this.self = new Ship(this, this.game, data);
		this.ShipGroup.add(this.self);
		this.game.camera.follow(this.self);
	},

	recvAddUser: function (data) {
		this.ShipGroup.add(new Ship(this, this.game, data));
	},

	recvRemoveUser: function (userID) {
		this.ShipGroup.forEach((ship) => {
			if (ship.userID === userID)
				ship.death();
		});
  },

  sendShareSelf: function () {
		return this.self.shareSelf();
	},

	sendKeyChange: function () {
		this.socket.sendKeyChange({
			i: this.self.userID,
			k: this.player.keys
		});
	},

	recvKeyChange: function (data) {
		this.ShipGroup.forEach(function (ship) {
			if (ship.userID === data.i) {
				ship.keyChange(data.k);
			}
		});
	},

	sendAngleChange: function () {
		this.socket.sendAngleChange({
			i: this.self.userID,
			a: this.player.angle
		})
	},

	recvAngleChange: function (data) {
		this.ShipGroup.forEach(function (ship) {
			if (ship.userID === data.i) {
				ship.angleChange(data.a);
			}
		});
	},

	// sendStateUpdate: function () {
	// 	this.socket.sendStateUpdate(this.self.getState());
	// },

	// recvStateUpdate: function (data) {
	// 	this.ShipGroup.forEach(function (ship) {
	// 		if (ship.userID === data.i) {
	// 			ship.recvStateUpdate(data);
	// 		}
	// 	})
	// },

	sendFire: function ({ x, y }) {
		this.socket.sendFire({
			i: this.self.userID,
			t: this.self.team,
			p: {
				x,
				y,
				a: this.player.angle - 3 * Math.PI / 4
			}
		});
	},

	recvFire: function (data) {
		this.LaserGroup.add(new Laser(this, this.game, data));
  },
  
  sendLaserHit: function(laser) {
    this.socket.sendLaserHit({
      i: this.self.userID,
      l: {
        i: laser.userID,
        t: laser.team
      }
    })
  },

  recvLaserHit: function(data) {
    this.ShipGroup.forEach(function (ship) {
			if (ship.userID === data.i) {
				ship.death();
			} else if (ship.userID == data.l.i) {
        ship.rewardPoints();
      }
    });
  }

};