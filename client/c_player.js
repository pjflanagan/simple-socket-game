import { SHIP_PROPS, LASER_PROPS } from '/helpers/index.js';

class Player {
	constructor(app) {
		this.app = app;

		this.timeout = 0;
		this.rounds = LASER_PROPS.ROUNDS;
		this.mouse = { x: 0, y: 0 };
		this.values = {
			keys: { u: false, d: false, l: false, r: false },
			angle: 0
		};

		window.addEventListener("mousemove", (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
		window.addEventListener("mousedown", (e) => { this.handleClick(); })
		document.addEventListener("visibilitychange", (e) => { this.defaultKeys(); });

	}

	get keys() {
		return this.values.keys;
	}

	set keys(newKeys) {
		if (this.diffKeys(newKeys)) {
			this.values.keys = newKeys;
			this.app.sendKeyChange();
		}
	}

	diffKeys(newKeys) {
		return newKeys.u !== this.values.keys.u ||
			newKeys.d !== this.values.keys.d ||
			newKeys.l !== this.values.keys.l ||
			newKeys.r !== this.values.keys.r;
	}

	defaultKeys() {
		console.log('DEAFAULT KEYS')
		this.values.keys = { u: false, d: false, r: false, l: false };
		this.app.sendKeyChange();
	}

	get angle() {
		return this.values.angle;
	}

	set angle(newAngle) {
		if (this.diffAngle(newAngle)) {
			this.values.angle = newAngle;
			this.app.sendAngleChange();
		}
	}

	diffAngle(newAngle) {
		return Math.abs(newAngle - this.values.angle) > .15;
	}

	handleClick() {
		if (this.rounds === 0)
			return;
		this.rounds -= 1;
		this.app.updateHUD();
		this.reload();

		let x = this.app.self.body.x + this.app.self.body.halfWidth;
		let y = this.app.self.body.y + this.app.self.body.halfHeight;
		this.app.sendFire({ x, y });
	}

	reload() {
		if (this.rounds === 0) {
			// this.clearTimeout(this.timeout)
			this.timeout = setTimeout(() => {
				this.rounds = LASER_PROPS.ROUNDS;
				this.app.updateHUD();
			}, LASER_PROPS.RELOAD_INTERVAL);
		}
	}

	input(self, game, keys) {
		if (!self) return;

		this.keys = keys;

		const dx = (self.body.x + self.body.halfWidth) - game.camera.x - this.mouse.x;
		const dy = (self.body.y + self.body.halfHeight) - game.camera.y - this.mouse.y;
		this.angle = Math.atan2(dy, dx) - Math.PI / 4;
	}
};

export { Player };