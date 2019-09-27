import { ClientSocket } from './c_socket.js';
import { Ship, Laser } from './sprites/index.js';
import { GAME_PROPS } from '../helpers/index.js';
import { Player } from './c_player.js';
import { HUD } from './c_hud.js';
// TODO: import Phaser from 'phaser';

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

	// OVERRIDES -------------------------------------------------------------------------------------

	preload: function () {
		this.game.load.spritesheet(
			'imgShip',
			'/assets/img_ship.png',
			100, 100, 2
		);
		this.game.load.spritesheet(
			'imgRedLaser',
			'/assets/img_red_laser.png',
			16, 16, 3
		);
		this.game.load.spritesheet(
			'imgBlueLaser',
			'/assets/img_blue_laser.png',
			16, 16, 3
		);
		this.game.load.spritesheet(
			'imgDebris',
			'/assets/img_debris.png',
			16, 16, 3
		);

		this.game.load.image('bg', '/assets/img_bg.png');

		this.player = new Player(this);
		this.hud = new HUD(this);
	},

	create: function () {
		this.game.world.setBounds(0, 0, GAME_PROPS.WORLD.WIDTH, GAME_PROPS.WORLD.HEIGHT);
		this.game.add.tileSprite(0, 0, GAME_PROPS.WORLD.WIDTH, GAME_PROPS.WORLD.HEIGHT, 'bg');
		this.game.stage.disableVisibilityChange = true; // keep game running if it loses the focus
		this.game.physics.startSystem(Phaser.Physics.ARCADE); // start the Phaser arcade physics engine

		this.drawZones();

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
    this.LaserGroup.forEach(function (laser) {
			laser.update();
		});
		this.player.input(this.self, this.game, {
			right: this.keyRight.isDown,
			left: this.keyLeft.isDown,
			up: this.keyUp.isDown,
			down: this.keyDown.isDown
		});
		this.game.physics.arcade.overlap(this.LaserGroup, this.ShipGroup, this.laserHit, null, this);
	},

	// GRAPHICS --------------------------------------------------------------------------------------

	drawZones: function () {
		const graphics = this.game.add.graphics(0, 0);
		graphics.beginFill(0xFF0000);
		graphics.alpha = 0.05;
		graphics.drawRect(0, 0, GAME_PROPS.WORLD.SAFE_ZONE_WIDTH, GAME_PROPS.WORLD.HEIGHT);
		graphics.endFill();
		this.RedZone = this.game.add.sprite(0, 0, graphics.generateTexture());
		this.RedZone.alpha = 0.05;
		graphics.beginFill(0x0000FF);
		graphics.alpha = 0.2;
		graphics.drawRect(GAME_PROPS.WORLD.WIDTH - GAME_PROPS.WORLD.SAFE_ZONE_WIDTH, 0, GAME_PROPS.WORLD.SAFE_ZONE_WIDTH, GAME_PROPS.WORLD.HEIGHT);
		graphics.endFill();
		this.BlueZone = this.game.add.sprite(0, 0, graphics.generateTexture());
		this.BlueZone.alpha = 0.2;
	},

	// HELPERS ---------------------------------------------------------------------------------------

	leave(name, score) {
		$(location).attr('href', `/?name=${name}&score=${score}`);
	},

	getTeam() {
		if (this.self) {
			return this.self.team;
		}
		return -1;
	},

	updateHUD() {
		this.hud.update();
	},

	laserHit: function (laser, ship) {
		if (laser.team !== ship.team) {
			this.sendHit(laser, ship);
		}
	},

	removeShip(ship) {
		this.ShipGroup.remove(ship);
	},

	// SOCKET ----------------------------------------------------------------------------------------

	recvAddSelf: function (data) {
		this.self = new Ship(this, this.game, data, true);
		this.ShipGroup.add(this.self);
		this.game.camera.follow(this.self);
		this.updateHUD();
	},

	recvAddUser: function (data) {
		this.ShipGroup.add(new Ship(this, this.game, data));
		this.updateHUD();
	},

	recvRemoveUser: function (userID) {
		this.ShipGroup.forEach((ship) => {
			if (ship.userID === userID)
				ship.death();
		});
		this.updateHUD();
	},

	getUserState: function () {
		return this.self.getState();
	},

	// KEY

	sendKeyChange: function () {
		this.socket.sendKeyChange({
			userID: this.self.userID,
			keys: this.player.keys
		});
	},

	recvKeyChange: function (data) {
		this.ShipGroup.forEach((ship) => {
			if (ship.userID === data.userID) {
				ship.keyChange(data.keys);
			}
		});
	},

	// ANGLE

	sendAngleChange: function () {
		this.socket.sendAngleChange({
			userID: this.self.userID,
			angle: this.player.angle
		});
	},

	recvAngleChange: function (data) {
		this.ShipGroup.forEach((ship) => {
			if (ship.userID === data.userID) {
				ship.angleChange(data.angle);
			}
		});
	},

	// FIRE

	sendFire: function ({ x, y }) {
		this.socket.sendFire({
			userID: this.self.userID,
			team: this.self.team,
			position: {
				x,
				y,
				a: this.player.angle - 3 * Math.PI / 4
			},
			// v: {
			//   x: this.self.body.velocity.x,
			//   y: this.self.body.velocity.y 
			// }
		});
	},

	recvFire: function (data) {
		this.LaserGroup.add(new Laser(this, this.game, data));
	},

	// HIT

	sendHit: function (laser, ship) {
    // TODO: share if you are a host
    if (this.self.userID === laser.userID) {
      this.socket.sendHit({
        target: {
          userID: ship.userID,
          team: ship.team,
          angle: laser.angle
        },
        origin: {
          userID: laser.userID,
          team: laser.team
        }
      });
    }
	},

	recvHit: function ({ origin, target }) {
		const playerUserID = this.self.userID;
		const leave = () => { this.leave(this.self.name, this.self.score); }

		this.ShipGroup.forEach(function (ship) {
			if (ship.userID === target.userID) {
				ship.death(target.angle);
				if (playerUserID === target.userID) {
					leave();
				}
			} else if (ship.userID == origin.userID) {
				ship.rewardPoints(origin.pointsAwarded);
			}
		});
		this.updateHUD();
	},

};

export { App };