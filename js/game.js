(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
	document.addEventListener("deviceready",onDeviceReady,false);
};
window.onDeviceReady = function () {
	console.log('device ready');
	var game = new Phaser.Game(288, 505, Phaser.AUTO, 'flappy-hell');

	// Game States
	game.state.add('boot', require('./states/boot'));
	game.state.add('menu', require('./states/menu'));
	game.state.add('play', require('./states/play'));
	game.state.add('preload', require('./states/preload'));
	

	game.state.start('boot');
}
},{"./states/boot":7,"./states/menu":8,"./states/play":9,"./states/preload":10}],2:[function(require,module,exports){
'use strict';

var Bird = function(game, x, y, frame) {
	Phaser.Sprite.call(this, game, x, y, 'bird', frame);
	this.anchor.setTo(0.5, 0.5);
	this.animations.add('flap');
	this.animations.play('flap', 12, true);

	this.flapSound = this.game.flapSound;

	this.name = 'bird';
	this.alive = false;
	this.killed = false;
	this.onGround = false;

	this.game.physics.arcade.enableBody(this);
	this.body.allowGravity = false;
	this.body.collideWorldBounds = true;

	this.events.onKilled.add(this.onKilled, this);
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.flap = function() {
	if(!this.killed){
		this.flapSound.play();
		this.body.velocity.y = -400;
		this.game.add.tween(this).to({
			angle: -40
		}, 100).start();
	}
	

};
Bird.prototype.update = function() {

	if (this.angle < 90 && this.alive) {
		this.angle += 2.5;
	}

	if (!this.alive) {
		this.body.velocity.x = 0;
	}

};

Bird.prototype.onKilled = function() {
	this.exists = true;
	this.visible = true;
	this.killed = true;
	this.animations.stop();
	var duration = 90 / this.y * 300;
	this.game.add.tween(this).to({
		angle: 90
	}, duration).start();
	console.log('killed');
	console.log('alive:', this.alive);
};

module.exports = Bird;
},{}],3:[function(require,module,exports){
'use strict';

var Ground = function(game, x, y, width, height) {  
  Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');

  this.autoScroll(-200,0);
  this.game.physics.arcade.enableBody(this);
  this.body.allowGravity = false;
  this.body.immovable = true;  
};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);  
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {  
  // write your prefab's specific update code here  
};

module.exports = Ground;
},{}],4:[function(require,module,exports){
'use strict';

var Pipe = function(game, x, y, frame) {
	Phaser.Sprite.call(this, game, x, y, 'pipe', frame);

	this.anchor.setTo(0.5, 0.5);
	this.game.physics.arcade.enableBody(this);

	this.body.allowGravity = false;
	this.body.immovable = true;
};

Pipe.prototype = Object.create(Phaser.Sprite.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.demolish = function() {
	this.body.allowGravity = true;
	this.body.velocity.y = -40;
	this.body.gravity.set(0, -1100);
	this.game.add.tween(this).to({
		angle: -40
	}, 10000).start();

	this.demolished = true;
}

Pipe.prototype.update = function() {

};

module.exports = Pipe;
},{}],5:[function(require,module,exports){
'use strict';


var Pipe = require('./pipe');

var PipeGroup = function(game, parent) {
	Phaser.Group.call(this, game, parent);


	// initialize your prefab here
	this.bottomPipe = new Pipe(this.game, 0, 440, 1);
	this.topPipe = new Pipe(this.game, 0, 0, 0);
	this.add(this.topPipe);
	this.add(this.bottomPipe);


	this.hasScored = false;

	this.setAll('body.velocity.x', -200);

};

PipeGroup.prototype = Object.create(Phaser.Group.prototype);
PipeGroup.prototype.constructor = PipeGroup;
PipeGroup.prototype.reset = function(x, y) {
	this.topPipe.reset(0, 0);
	this.bottomPipe.reset(0, 440);
	this.x = x;
	this.y = y;
	this.setAll('body.velocity.x', -200);
	this.hasScored = false;
	this.exists = true;
};

PipeGroup.prototype.checkWorldBounds = function() {
	if (!this.topPipe.inWorld) {
		this.exists = false;
	}
};
PipeGroup.prototype.stop = function() {
	this.setAll('body.velocity.x', 0);
};
PipeGroup.prototype.update = function() {
	this.checkWorldBounds();
};


module.exports = PipeGroup;
},{"./pipe":4}],6:[function(require,module,exports){
'use strict';

var Scoreboard = function(game) {

	var gameover;

	Phaser.Group.call(this, game);
	gameover = this.create(this.game.width / 2, 100, 'gameover');
	gameover.anchor.setTo(0.5, 0.5);

	this.scoreboard = this.create(this.game.width / 2, 200, 'scoreboard');
	this.scoreboard.anchor.setTo(0.5, 0.5);

	this.scoreText = this.game.add.bitmapText(this.scoreboard.width - 10, 180, 'flappyfont', '', 18);
	this.add(this.scoreText);

	this.bestScoreText = this.game.add.bitmapText(this.scoreboard.width - 10, 230, 'flappyfont', '', 18);
	this.add(this.bestScoreText);

	// add our start button with a callback
	this.startButton = this.game.add.button(this.game.width / 2, 300, 'startButton', this.startClick, this);
	this.startButton.anchor.setTo(0.5, 0.5);

	this.add(this.startButton);

	this.y = this.game.height;
	this.x = 0;

};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;
Scoreboard.prototype.show = function(score) {
	var medal, bestScore;

	this.isShown = true;

	// Step 1
	this.scoreText.setText(score.toString());

	if (!!localStorage) {
		// Step 2
		bestScore = localStorage.getItem('bestScore');

		// Step 3
		if (!bestScore || bestScore < score) {
			bestScore = score;
			localStorage.setItem('bestScore', bestScore);
		}
	} else {
		// Fallback. LocalStorage isn't available
		bestScore = 'N/A';
	}
	// Step 4
	this.bestScoreText.setText(bestScore + '');

	// Step 5 & 6
	if (score >= 10 && score < 30) {
		medal = this.game.add.sprite(-65, 7, 'medals', 1);
		medal.anchor.setTo(0.5, 0.5);
		this.scoreboard.addChild(medal);
	} else if (score >= 30) {
		medal = this.game.add.sprite(-65, 7, 'medals', 0);
		medal.anchor.setTo(0.5, 0.5);
		this.scoreboard.addChild(medal);
	}

	// Step 7
	if (medal) {

		var emitter = this.game.add.emitter(medal.x, medal.y, 400);
		this.scoreboard.addChild(emitter);
		emitter.width = medal.width;
		emitter.height = medal.height;

		emitter.makeParticles('particle');

		emitter.setRotation(-100, 100);
		emitter.setXSpeed(0, 0);
		emitter.setYSpeed(0, 0);
		emitter.minParticleScale = 0.25;
		emitter.maxParticleScale = 0.5;
		emitter.setAll('body.allowGravity', false);

		emitter.start(false, 1000, 1000);

	}
	this.game.add.tween(this).to({
		y: 0
	}, 1000, Phaser.Easing.Bounce.Out, true);
};
Scoreboard.prototype.startClick = function() {
	this.game.state.start('play');
};


module.exports = Scoreboard;
},{}],7:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],8:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {
    // add the background sprite
    this.background = this.game.add.sprite(0, 0, 'background');
  },
  create: function() {
    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    this.ground = this.game.add.tileSprite(0, 400, 335, 112, 'ground');
    this.ground.autoScroll(-100, 0);

    this.titleGroup = this.game.add.group();

    this.title = this.game.add.sprite(0,0,'title');
    this.titleGroup.add(this.title);

    this.bird = this.game.add.sprite(200,5,'bird');
    this.titleGroup.add(this.bird);

    this.bird.animations.add('flap');
    this.bird.animations.play('flap', 12, true);

    this.titleGroup.x = 30;
    this.titleGroup.y = 100;

    this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

    this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
    this.startButton.anchor.setTo(0.5,0.5);

    
  },
  startClick: function() {
    this.game.state.start('play');
  }, 
  update: function() {
   
  }
};

module.exports = Menu;

},{}],9:[function(require,module,exports){
'use strict';

var Bird = require('../prefabs/bird');
var Ground = require('../prefabs/ground');
var Pipe = require('../prefabs/pipe');
var PipeGroup = require('../prefabs/pipeGroup');
var Scoreboard = require('../prefabs/scoreboard');
var emitter;


function Play() {}
Play.prototype = {
    create: function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 1200;

        this.background = this.game.add.tileSprite(0, 0, 288, 555, 'background');
        this.background.autoScroll(-30, 0);

        //   Emitters have a center point and a width/height, which extends from their center point to the left/right and up/down
        emitter = this.game.add.emitter(this.game.world.centerX, 0, 200);

        //   This emitter will have a width of 800px, so a particle can emit from anywhere in the range emitter.x += emitter.width / 2
        emitter.width = this.game.width;

        emitter.makeParticles('ghost');

        emitter.minParticleSpeed.set(100, 300);
        emitter.maxParticleSpeed.set(100, 400);
        emitter.setXSpeed(0, -200);
        emitter.setYSpeed(0, 100);

        emitter.setRotation(0, 0);
        emitter.setAlpha(0.3, 0.8);
        emitter.setScale(0.5, 0.5, 1, 1);
        emitter.gravity = -1200;

        //   false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
        //   The 5000 value is the lifespan of each particle before it's killed
        emitter.start(false, 5000, 1000);

        this.bird = new Bird(this.game, 100, this.game.height / 2);
        this.game.add.existing(this.bird);

        this.score = 0;
        this.scoreText = this.game.add.bitmapText(this.game.width / 2, 10, 'flappyfont', this.score.toString(), 24);
        this.scoreText.visible = false;

        this.flapKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.flapKey.onDown.add(this.bird.flap, this.bird);
        this.flapKey.onDown.addOnce(this.startGame, this);

        this.game.input.onDown.add(this.bird.flap, this.bird);
        this.game.input.onDown.addOnce(this.startGame, this);
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

        this.pipes = this.game.add.group();
        this.ground = new Ground(this.game, 0, 400, 335, 112);
        this.game.add.existing(this.ground);

        this.instructionGroup = this.game.add.group();
        this.instructionGroup.add(this.game.add.sprite(this.game.width / 2, 100, 'getReady'));
        this.instructionGroup.add(this.game.add.sprite(this.game.width / 2, 325, 'instructions'));
        this.instructionGroup.setAll('anchor.x', 0.5);
        this.instructionGroup.setAll('anchor.y', 0.5);

        this.pipeGenerator = null;

        this.gameover = false;

        this.pipeHitSound = this.game.add.audio('pipeHit');
        this.groundHitSound = this.game.add.audio('groundHit');
        this.scoreSound = this.game.add.audio('score');
        this.scoreSound.volume = 0.3;

    },
    update: function() {
        // enable collisions between the bird and the ground
        this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this);

        // enable collisions between the bird and each group in the pipes group
        if (!this.gameover) {
            this.pipes.forEach(function(pipeGroup) {
                this.checkScore(pipeGroup);
                this.game.physics.arcade.collide(this.bird, pipeGroup, this.deathHandler, null, this);
            }, this);
        }
    },
    shutdown: function() {
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        this.bird.destroy();
        this.pipes.destroy();
        this.scoreboard.destroy();
    },
    startGame: function() {
        if (!this.bird.alive && !this.gameover) {
            this.bird.body.allowGravity = true;
            this.bird.alive = true;
            this.scoreText.visible = true;

            // add a timer
            this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generatePipes, this);
            this.pipeGenerator.timer.start();

            this.instructionGroup.destroy();
        }
    },
    checkScore: function(pipeGroup) {

        if (pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
            pipeGroup.hasScored = true;
            this.score++;
            this.scoreText.setText(this.score.toString());
            this.scoreSound.play();
        }
    },
    deathHandler: function(bird, enemy) {

        if (enemy instanceof Ground && !this.bird.onGround) {
            this.groundHitSound.play();
            this.scoreboard = new Scoreboard(this.game);
            this.game.add.existing(this.scoreboard);
            this.scoreboard.show(this.score);
            this.bird.onGround = true;
        } else if (enemy instanceof Pipe) {
            this.pipeHitSound.play();
            enemy.demolish();
        }

        if (!this.gameover) {
            this.gameover = true;
            this.bird.kill();
            this.pipes.callAll('stop');
            this.pipeGenerator.timer.stop();
            this.ground.stopScroll();
        }
    },
    generatePipes: function() {
        var pipeY = this.game.rnd.integerInRange(-100, 100);
        var pipeGroup = this.pipes.getFirstExists(false);
        if (!pipeGroup) {
            pipeGroup = new PipeGroup(this.game, this.pipes);
        }
        pipeGroup.reset(this.game.width + 20, pipeY);

    }
};

module.exports = Play;
},{"../prefabs/bird":2,"../prefabs/ground":3,"../prefabs/pipe":4,"../prefabs/pipeGroup":5,"../prefabs/scoreboard":6}],10:[function(require,module,exports){
'use strict';

function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.game.width / 2, this.game.height / 2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(this.asset);
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);

    this.load.image('background', 'assets/bonebg.png');
    this.load.image('ground', 'assets/boneground.png');
    this.load.image('ghost', 'assets/ghost.png');
    this.load.image('title', 'assets/title.png');
    this.load.image('startButton', 'assets/start-button.png');
    this.load.image('instructions', 'assets/instructiondarks.png');
    this.load.image('getReady', 'assets/get-ready.png');

    this.load.image('scoreboard', 'assets/bonescore.png');
    this.load.image('gameover', 'assets/gameover.png');
    this.load.spritesheet('medals', 'assets/medals.png', 44, 46, 2);
    this.load.image('particle', 'assets/particle.png');

    this.load.bitmapFont('flappyfont', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');

    this.load.audio('score', '/assets/score.wav');
    this.load.audio('flap', '/assets/flap.wav');
    this.load.audio('pipeHit', '/assets/pipe-hit.wav');
    this.load.audio('groundHit', '/assets/ground-hit.wav');

    this.game.scoreSound = new Media('assets/score.wav');
    this.game.flapSound = new Media('assets/flap.wav');

    this.load.spritesheet('pipe', 'assets/bonepipes.png', 54, 320, 2);
    this.load.spritesheet('bird', 'assets/ghostbird.png', 34, 24, 3);
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if (!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;
},{}]},{},[1])