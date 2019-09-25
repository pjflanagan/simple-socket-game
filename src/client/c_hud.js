import { GAME_PROPS, LASER_PROPS } from '../helpers/index.js';

export class HUD {
	constructor(app) {
		this.app = app;
	}

	update() {
		// take data from the app and add it to the HUD
		// for asteroid in asteroids tally team score

		let red = 0
		let blue = 0;
		this.app.ShipGroup.forEach(ship => {
			if (ship.team === GAME_PROPS.TEAM.RED) {
				red += ship.score;
			} else {
				blue += ship.score;
			}
			// show 6 (top 5 and user, if user is in top 5 show 6th place too)
		});
		$('#hud #red').text(red).css({ width: `${100 * red / (red + blue)}%` });
		$('#hud #blue').text(blue).css({ width: `${100 * blue / (red + blue)}%` });

		$('#hud #rounds').empty();
		for (let i = 0; i < LASER_PROPS.ROUNDS; ++i) {
			const blank = (i < this.app.player.rounds) ? '' : 'blank';
			$('#hud #rounds').append(`<div class="round ${blank}"></div>`);
		}
	}
}