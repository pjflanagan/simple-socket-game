const { Builder } = require('selenium-webdriver');
const { ConstantlyShootingPlayer } = require('./player.js');

async function run(PlayerType, name) {
	const driver = await new Builder().forBrowser('safari').build();
	const player = new PlayerType(driver, name);
	try {
		await player.loadGame();
		await player.play();
	} finally {
		await player.quit();
	}
}

(async function main() {
	await Promise.all([
		run(ConstantlyShootingPlayer, 'shooter1'),
		// run(ConstantlyShootingPlayer, 'shooter2'),
		// run(ConstantlyMovingPlayer, 'driver1'),
		// run(RandomPlayer, 'random1')
	])

})();