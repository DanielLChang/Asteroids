let Util = require('./util');
let MovingObject = require('./moving_object');
let Bullet = require('./bullet');

const DEFAULTS = { COLOR: "#1F50D2", RADIUS: 10};


let Ship = function (options) {
  options.color = DEFAULTS.COLOR;
  options.radius = DEFAULTS.RADIUS;
  options.vel = options.vel || [0, 0];

  MovingObject.call(this, options);
};

Util.inherits(Ship, MovingObject);

Ship.prototype.power = function (impulse) {
  this.vel[0] += impulse[0];
  this.vel[1] += impulse[1];
};

Ship.prototype.relocate = function () {
  this.pos = this.game.randomPosition();
  this.vel = [0, 0];
};

Ship.prototype.fireBullet = function () {
  let norm = Util.norm(this.vel);

  if (norm === 0) {
    return;
  }

  let relVel = Util.scale(Util.dir(this.vel), Bullet.SPEED);

  let bulletVel = [relVel[0] + this.vel[0], relVel[1] + this.vel[1]];

  let bullet = new Bullet({
    pos: this.pos,
    vel: bulletVel,
    color: this.color,
    game: this.game
  });

  this.game.bullets.push((bullet));
};

module.exports = Ship;
