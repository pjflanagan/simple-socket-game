import { GAME_PROPS, LASER_PROPS } from '../helpers/index.js';

export class HUD {
	constructor(app) {
    this.app = app;
  }
  
  updateLaser() {
    $('#hud #rounds').empty();
		for (let i = 0; i < LASER_PROPS.ROUNDS; ++i) {
			const blank = (i < this.app.player.rounds) ? '' : 'blank';
			$('#hud #rounds').append(`<div class="round ${blank}"></div>`);
		}
  }

	updateScores() {
    this.app.ShipGroup.sort('score', Phaser.Group.SORT_DESCENDING)

		let red = 0
    let blue = 0;
    $('#hud #highscores').empty();
    let i = 1;
		this.app.ShipGroup.forEach((ship) => {
      let team = 'red';
			if (ship.team === GAME_PROPS.TEAM.RED) {
				red += ship.score;
			} else {
        blue += ship.score;
        team = 'blue';
      }
      
      if (i < 5) {
        $('#hud #highscores').append(`<p class="${ team }">${ i } ${ ship.name } ${ ship.score }</p>`)
      }

      ++i;
		});
		$('#hud #red').text(red).css({ width: `${100 * red / (red + blue)}%` });
		$('#hud #blue').text(blue).css({ width: `${100 * blue / (red + blue)}%` });

	}
}