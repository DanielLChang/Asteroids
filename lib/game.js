const Util = require("./util");
const Ship = require('./ship');
const Bullet = require('./bullet');
const Asteroid = require('./asteroid');

const Game = function() {
  this.asteroids = [];
  this.ships = [];
  this.bullets = [];

  this.addAsteroids();
};

Game.DIM_X = window.innerWidth;
Game.DIM_Y = window.innerHeight;
Game.NUM_ASTEROIDS = 25;

Game.prototype.randomPosition = function() {
  const RAND_X = Game.DIM_X * Math.random();
  const RAND_Y = Game.DIM_Y * Math.random();
  return [RAND_X, RAND_Y];
};

Game.prototype.isOutOfBounds = function (pos) {
  return (pos[0] < 0) ||
         (pos[1] < 0) ||
         (pos[0] > Game.DIM_X) ||
         (pos[1] > Game.DIM_Y);
};

Game.prototype.moveObjects = function(delta) {
  this.allObjects().forEach(object => {
    object.move(delta);
  });
};

Game.prototype.addShip = function() {
  const ship = new Ship({
    pos: this.randomPosition(),
    game: this
  });

  this.ships.push(ship);

  return ship;
};

Game.prototype.addAsteroids = function () {
  for (let i = 0; i < Game.NUM_ASTEROIDS; i++) {
    this.asteroids.push(new Asteroid({ game: this }));
  }
};

Game.prototype.remove = function(object) {
  if (object instanceof Bullet) {
    this.bullets.splice(this.bullets.indexOf(object), 1);
  } else if (object instanceof Asteroid) {
    this.asteroids.splice(this.asteroids.indexOf(object), 1);
  } else if (object instanceof Ship) {
    this.ships.splice(this.ships.indexOf(object), 1);
  }
};

Game.prototype.wrap = function(pos) {
  const NEW_X = Util.wrap(pos[0], Game.DIM_X);
  const NEW_Y = Util.wrap(pos[1], Game.DIM_Y);
  return [NEW_X, NEW_Y];
};

Game.prototype.step = function(delta) {
  this.moveObjects(delta);
  this.checkCollisions();
};

Game.prototype.checkCollisions = function () {
  const allObjects = this.allObjects();

  for (let i = 0; i < allObjects.length; i++) {
    for (let j = 0; j < allObjects.length; j++) {
      const object1 = allObjects[i];
      const object2 = allObjects[j];

      if (object1.isCollidedWith(object2)) {
        const collision = object1.collideWith(object2);
        if (collision) {
          return;
        }
      }
    }
  }
};

Game.prototype.draw = function(ctx) {
  ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, Game.DIM_X, Game.DIM_Y);

  this.allObjects().forEach(object => {
    // debugger;
    object.draw(ctx);
  });

  ctx.clearRect(Game.DIM_X, 0, Game.DIM_X, Game.DIM_Y);
  ctx.clearRect(0, Game.DIM_Y, Game.DIM_X * 2, Game.DIM_Y);
};

Game.prototype.allObjects = function () {
  return [].concat(this.asteroids, this.ships, this.bullets);
};

module.exports = Game;
