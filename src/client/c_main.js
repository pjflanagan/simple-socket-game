import { ClientSocket } from './c_socket.js';
import { Ship, Laser } from './sprites/index.js';
import { GAME_PROPS, SHIP_PROPS } from '../helpers/index.js';
import { Player } from './c_player.js';
import { HUD } from './c_hud.js';
import { Interpolator } from './c_interpolator.js';
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
			SHIP_PROPS.DIAMETER, SHIP_PROPS.DIAMETER, 2
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
		this.ToGroup = this.game.add.group();
		this.ships = [];

    this.interpolater = new Interpolator(this, GAME_PROPS.DELAY);
    this.socket = new ClientSocket(this);

		this.keyLeft = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
		this.keyRight = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
		this.keyUp = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
		this.keyDown = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
	},

	update: function () {
    this.interpolater.update();
		this.ships.forEach(function (ship) {
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

	updateHUD(type) {
		switch (type) {
			case 'score':
				this.hud.updateScores();
			case 'laser':
				this.hud.updateLaser();
			default:
				this.hud.updateLaser();
				this.hud.updateScores();
		}
	},

	laserHit: function (laser, ship) {
		if (laser.team !== ship.player.team) {
			this.sendHit(laser, ship);
		}
	},

	removeShip(ship) {
		this.ToGroup.remove(ship.to);
		this.ShipGroup.remove(ship.ship);
	},

	// SOCKET ----------------------------------------------------------------------------------------

	recvAddSelf: function (data) {
		this.self = new Ship(this, this.game, data, true);
		this.ships.push(this.self);
		this.game.camera.follow(this.self.ship);
		this.updateHUD('both');
	},

	recvAddUser: function (data) {
		this.ships.push(new Ship(this, this.game, data));
		this.updateHUD('score');
	},

	recvRemoveUser: function (userID) {
		this.ships.forEach((ship) => {
			if (ship.userID === userID)
				ship.death();
		});
		this.updateHUD('score');
	},

	getUserState: function () {
		return this.self.getState();
	},

	// KEY

	sendKeyChange: function () {
		const to = this.self.getTo();
		this.socket.sendKeyChange({
			userID: this.self.userID,
			keys: this.player.keys,
			to
		});
	},

	recvKeyChange: function (data) {
		this.ships.forEach((ship) => {
			if (ship.userID === data.userID) {
				ship.keyChange(data);
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
		this.ships.forEach((ship) => {
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
			}
		});
	},

	recvFire: function (data) {
		this.LaserGroup.add(new Laser(this, this.game, data));
	},

	// HIT

	sendHit: function (laser, ship) {
		// TODO: share if you are a host if this.isHost
		if (this.self.userID === laser.userID) {
			this.socket.sendHit({
				target: {
					userID: ship.player.userID,
					team: ship.player.team,
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

		this.ships.forEach(function (ship) {
			if (ship.userID === target.userID) {
				ship.death(target.angle);
				if (playerUserID === target.userID) {
					leave();
				}
			} else if (ship.userID == origin.userID) {
				ship.rewardPoints(origin.newScore);
			}
    });
    // this.LaserGroup.forEach(function(laser) {
    //   if(laser.laserID === origin.laserID) {

    //   }
    // });
		this.updateHUD('score');
	},

};

export { App };