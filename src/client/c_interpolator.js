import { fp } from '../helpers/index.js';

class Interpolator {
  constructor(app, delay) {
    this.app = app;
    this.delay = delay;
    this.events = [];
  }

  // adds an event to the queue
  queue(event, func, buffer) {
    const data = fp.decode(event, buffer);
    this.events.push({ timestamp: data.timestamp, func, data });
  }

  // run all events in the queue with timestamp greater than now - GAME.DELAY
  update() {
    const now = new Date().getTime();
    this.events.forEach(({ timestamp, func, data }) => {
      if (timestamp > (now - this.delay)) {
        func(data);
      }
    });
  }
}

export { Interpolator };