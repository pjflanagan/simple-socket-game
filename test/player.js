const { By, Key } = require('selenium-webdriver');

// Parent Player

class Player {
  constructor(driver, name) {
    this.driver = driver;
    this.name = name;
  }

  async loadGame() {
    await this.driver.get(`http://localhost:6415/game?name=${this.name}`);
  }

  onDeath() {
    // await this.driver.findElement(By.className('text')).sendKeys('webdriver', Key.RETURN);
  }

  async quit() {
    this.driver.quit();
  }
}

// Random Player

class RandomPlayer extends Player {
  async play() {
    await this.driver.sleep(3000);
  }
}

// Constantly Shooting Player

class ConstantlyShootingPlayer extends Player {
  async play() {

  }
}

// Contantly Moving Player

class ConstantlyMovingPlayer extends Player {
  async play() {

  }
}

// Export

module.exports = {
  RandomPlayer,
  ConstantlyMovingPlayer,
  ConstantlyShootingPlayer
}