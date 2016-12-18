/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const GameView = __webpack_require__(1);
	const Game = __webpack_require__(2);
	// const Asteroid = require('./asteroid.js');
	// const MovingObject = require('./moving_object.js');

	document.addEventListener("DOMContentLoaded", function() {
	  const canvasEl = document.getElementsByTagName("canvas")[0];
	  canvasEl.height = window.innerHeight;
	  canvasEl.width = window.innerWidth;

	  const ctx = canvasEl.getContext("2d");
	  const g = new Game();
	  new GameView(g, ctx).start();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(2);
	// const Keymaster = require('./keymaster.js');

	const GameView = function(game, ctx) {
	  this.ctx = ctx;
	  this.game = game;
	  this.ship = this.game.addShip();
	};

	GameView.MOVES = {
	  "w": [ 0, -1],
	  "a": [-1,  0],
	  "s": [ 0,  1],
	  "d": [ 1,  0],
	};

	GameView.prototype.bindKeyHandlers = function () {
	  const ship = this.ship;

	  Object.keys(GameView.MOVES).forEach((k) => {
	    let move = GameView.MOVES[k];
	    key(k, function () { ship.power(move); });
	  });

	  key("space", function () { ship.fireBullet() });
	};

	GameView.prototype.start = function () {
	  this.bindKeyHandlers();
	  this.lastTime = 0;
	  requestAnimationFrame(this.animate.bind(this));

	};

	GameView.prototype.animate = function(time) {
	  const delta = time - this.lastTime;

	  this.game.step(delta);
	  this.game.draw(this.ctx);
	  this.lastTime = time;

	  requestAnimationFrame(this.animate.bind(this));
	};

	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Util = __webpack_require__(5);
	const Ship = __webpack_require__(3);
	const Bullet = __webpack_require__(6);
	const Asteroid = __webpack_require__(7);

	const Game = function() {
	  this.asteroids = [];
	  this.ships = [];
	  this.bullets = [];

	  this.addAsteroids();
	};

	Game.DIM_X = 1000;
	Game.DIM_Y = 500;
	Game.NUM_ASTEROIDS = 10;

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
	  this.ships.push(new Ship({
	    pos: this.randomPosition(),
	    game: this
	  }));
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	let Util = __webpack_require__(5);
	let MovingObject = __webpack_require__(4);
	let Bullet = __webpack_require__(6);

	const DEFAULTS = { COLOR: "#1F50D2", RADIUS: 10};

	Util.inherits(Ship, MovingObject);

	let Ship = function (options) {
	  options.color = DEFAULTS.COLOR;
	  options.radius = DEFAULTS.RADIUS;
	  options.vel = options.vel || [0, 0];

	  MovingObject.call(this, options);
	};

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


/***/ },
/* 4 */
/***/ function(module, exports) {

	const Util = ('./utils');

	const MovingObject = function(options) {
	  this.pos = options.pos;
	  this.vel = options.vel;
	  this.radius = options.radius;
	  this.color = options.color;
	  this.game = options.game;
	};

	MovingObject.prototype.collideWith = function (other) {};
	MovingObject.prototype.isWrappable = true;

	MovingObject.prototype.draw = function(ctx) {
	  ctx.fillStyle = this.color;
	  ctx.beginPath();
	  ctx.arc(this.pos[0], this.pos[1], this.radius, 0, 2 * Math.PI, false);
	  ctx.fill();
	};

	const TIME_DELTA = 1000/60;

	MovingObject.prototype.move = function (delta) {
	  const vel = delta / TIME_DELTA,
	      moveX = this.vel[0] * vel,
	      moveY = this.vel[1] * vel;

	  this.pos = [this.pos[0] + moveX, this.pos[1] + moveY];

	  if (this.game.isOutOfBounds(this.pos)) {
	    if (this.isWrappable) {
	      this.pos = this.game.wrap(this.pos);
	    } else {
	      this.remove();
	    }
	  }
	};

	MovingObject.prototype.remove = function () {
	  this.game.remove(this);
	};

	MovingObject.prototype.isCollidedWith = function (other) {
	  const centerDist = Util.dist(this.pos, other.pos);
	  return centerDist < (this.radius + other.radius);
	};

	module.exports = MovingObject;


/***/ },
/* 5 */
/***/ function(module, exports) {

	const Util = {

	  dir (vec) {
	    var norm = Util.norm(vec);
	    return Util.scale(vec, 1 / norm);
	  },

	  dist (pos1, pos2) {
	    return Math.sqrt(
	      Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2)
	    );
	  },

	  norm (vec) {
	    return Util.dist([0, 0], vec);
	  },

	  randomVec (length) {
	    var deg = 2 * Math.PI * Math.random();
	    return Util.scale([Math.sin(deg), Math.cos(deg)], length);
	  },

	  scale (vec, m) {
	    return [vec[0] * m, vec[1] * m];
	  },
	  inherits (ChildClass, BaseClass) {
	    function Surrogate () { this.constructor = ChildClass; }
	    Surrogate.prototype = BaseClass.prototype;
	    ChildClass.prototype = new Surrogate();
	  },

	  wrap (coord, max) {
	    if (coord < 0) {
	      return max - (coord % max);
	    } else if (coord > max) {
	      return coord % max;
	    } else {
	      return coord;
	    }
	  }
	};

	module.exports = Util;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	const Util = __webpack_require__(5);
	const MovingObject = __webpack_require__(4);

	Util.inherits(Bullet, MovingObject);

	const Bullet = function(options) {
	  options.radius = Bullet.RADIUS;

	  MovingObject.call(this, options);
	};

	Bullet.RADIUS = 2;
	Bullet.SPEED = 10;

	Bullet.prototype.isWrappable = false;

	module.exports = Bullet;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Util = __webpack_require__(5);
	const MovingObject = __webpack_require__(4);
	const Ship = __webpack_require__(3);
	const Bullet = __webpack_require__(6);

	const DEFAULTS = {
	  COLOR: "#B59573",
	  RADIUS: 20,
	  SPEED: 1
	};

	Util.inherits(Asteroid, MovingObject);

	const Asteroid = function (options = {}) {
	  options.color = DEFAULTS.COLOR;
	  options.radius = DEFAULTS.RADIUS;
	  options.pos = options.pos || options.game.randomPosition();
	  options.vel = options.vel || Util.randomVec(DEFAULTS.SPEED);

	  MovingObject.call(this, options);
	};

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


/***/ }
/******/ ]);