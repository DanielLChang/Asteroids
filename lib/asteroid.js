const Util = require("./util");
const MovingObject = require("./moving_object");
const Ship = require("./ship");
const Bullet = require("./bullet");

const DEFAULTS = {
  COLOR: "#B59573",
  RADIUS: 20,
  SPEED: 1
};


const Asteroid = function (options = {}) {
  options.color = DEFAULTS.COLOR;
  options.radius = DEFAULTS.RADIUS;
  options.pos = options.pos || options.game.randomPosition();
  options.vel = options.vel || Util.randomVec(DEFAULTS.SPEED);

  MovingObject.call(this, options);
};

Util.inherits(Asteroid, MovingObject);

Asteroid.prototype.collideWith = function (other) {
  if (other instanceof Ship) {
    other.relocate();
    return true;
  } else if (other instanceof Bullet) {
    this.remove();
    other.remove();
    return true;
  }
};

module.exports = Asteroid;
