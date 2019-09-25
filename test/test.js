const { Builder } = require('selenium-webdriver');
const { RandomPlayer } = require('./player.js');
 
(async function main() {
  const driver = await new Builder().forBrowser('safari').build();
  const player = new RandomPlayer(driver, 'random');
  try {
    await player.loadGame();
    await player.play();
  } finally {
    await player.quit();
  }
})();