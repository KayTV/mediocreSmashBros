var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game')

var PhaserGame = function () {
  this.player = null;
  this.ground = null;
  this.cursors;
  this.playerHealth = 100;
  this.playerHealthText;
  this.stationary = null;
  this.floatingPlatforms = null;

  this.facing = 'right';
  this.jumpTimer = 0;
  this.locked = false;
  this.lockedTo = null;
  this.wasLocked = false;
  this.willJump = false;
  this.jumpCount = 0;
};

PhaserGame.prototype = {
  // Initialize Game Render and Physics Systen
  init: function () {
    this.game.renderer.renderSession.roundPixels = true;
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 600;
    this.world.resize(800*2, 600);
  },

  preload: function () {
    // Load assets
    this.load.image('background', 'assets/waterLevel/coralBackground.png');
    this.load.image('rightPlatform', 'assets/waterLevel/rightwaterplatform.png');
    this.load.image('smallLeftPlatform', 'assets/waterLevel/smallLeftWaterPlatform.png');
    this.load.image('smallPlatform', 'assets/waterLevel/smallPlatform.png');
    this.load.image('floor', 'assets/waterLevel/waterFloor.png');
    this.load.image('bubble', 'assets/waterLevel/bubble.png');
    this.load.spritesheet('shark', 'assets/waterLevel/shark1.png', 85, 47);
    this.load.spritesheet('mario', 'assets/sprites/mariosprite.png', 21, 35);
    this.load.spritesheet('dude', 'assets/sprites/dude.png', 32, 48);
  }, //end of preload

  create: function () {
    // Initialize background
    this.background = this.add.tileSprite(0, 0, 800, 600, 'background');
    this.background.fixedToCamera = true;

    this.ground = this.add.tileSprite(0, 600, 1600, 20, 'floor');
    this.physics.arcade.enable(this.ground);
    this.ground.immovable = true;
    this.ground.body.collideWorldBounds = true;

    // Fixed ground glitch with below code, but ground does not extend full width
    // this.ground = this.add.physicsGroup();
    // this.ground.create(0, 570, 'floor')
    // this.ground.setAll('body.allowGravity', false);
    // this.ground.setAll('body.immovable', true);

    // create stationary platforms
    this.stationary = this.add.physicsGroup();
    this.stationary.create(1450, 150, 'rightPlatform');
    this.stationary.setAll('body.allowGravity', false);
    this.stationary.setAll('body.immovable', true);

    // create moving platforms
    this.floatingPlatforms = this.add.physicsGroup();
    this.floatingPlatforms.collideWorldBounds = true;
    // this.floatingPlatforms.setAll('body.immovable', true);
    this.physics.arcade.enable(this.floatingPlatforms);

    this.floatingPlatform1 = new MovingPlatform(this.game, 0, 300, 'smallLeftPlatform', this.floatingPlatforms)
    this.floatingPlatform1.addMotionPath([
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 3500, yEase: "Sine.easeIn" },
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 3500, yEase: "Sine.easeIn" }
      ])

    this.floatingPlatform2 = new MovingPlatform(this.game, 400, 100, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform2.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 3500, yEase: "Sine.easeIn" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 3500, yEase: "Sine.easeIn" }
      ])

    this.floatingPlatform3 = new MovingPlatform(this.game, 700, 400, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform3.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+50", ySpeed: 3500, yEase: "Sine.easeIn" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-50", ySpeed: 3500, yEase: "Sine.easeIn" }
      ])

    this.floatingPlatform3 = new MovingPlatform(this.game, 1100, 200, 'smallPlatform', this.floatingPlatforms)
    this.floatingPlatform3.addMotionPath([
      { x: "+0", xSpeed: 6000, xEase: "Linear", y: "+150", ySpeed: 3500, yEase: "Sine.easeIn" },
      { x: "-0", xSpeed: 6000, xEase: "Linear", y: "-150", ySpeed: 3500, yEase: "Sine.easeIn" }
      ])

    // Run floating platforms
    this.floatingPlatforms.callAll('start')

    // create shark baddie
    this.baddies = this.add.physicsGroup();
    this.shark = new Baddie(this.game, -100, 400, 'shark', this.baddies)
    this.shark.addMotionPath([
      { x: "+600", xSpeed: 6000, xEase: "Linear", y: "+0", ySpeed: 2500, yEase: "Sine.easeIn" },
      { x: "-500", xSpeed: 6000, xEase: "Linear", y: "+0", ySpeed: 2500, yEase: "Sine.easeIn" }
    ])

    // Run animation for baddies
    this.baddies.callAll('start');

    // Instantiate cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);

    // Create Player
    // Mario Sprite
    // this.player = this.add.sprite(0, 200, 'mario')
    // this.physics.arcade.enable(this.player);
    // this.player.body.collideWorldBounds = true;
    // this.player.body.setSize(20, 20, 5, 16);
    // this.player.body.gravity.y = 600;

    //  Dude Sprite
    this.player = this.add.sprite(32, 0, 'dude');
    this.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    // this.player.body.gravity.y = 600;

    // this.camera.follow(this.player);

    //camera follows player
    this.camera.follow(this.player)

    // Player directional animations
    this.player.animations.add('left', [0, 1, 2, 3, 4], 11, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [7, 8, 9, 10, 11], 11, true);

    // Player1 playerHealth indicator
    this.playerHealthText = game.add.text(16, 16, 'Health: 100', {
      fontSize: '32px',
      fill: '#000'
    })
  },   //end of create

  customSep: function (player, platform) {
    if (!this.locked && player.body.velocity.y > 0)
    {
      this.locked = true;
      this.lockedTo = platform;
      platform.playerLocked = true;
      player.body.velocity.y = 0;
    }
  },

  checkLock: function () {
      this.player.body.velocity.y = 0;
      //  If the player has walked off either side of the platform then they're no longer locked to it
      if (this.player.body.right < this.lockedTo.body.x || this.player.body.x > this.lockedTo.body.right)
      { this.cancelLock(); }
    },

    cancelLock: function () {
      this.wasLocked = true;
      this.locked = false;
    },

    preRender: function () {
      if (this.game.paused)
      { //  Because preRender still runs even if your game pauses!
        return;}
      if (this.locked || this.wasLocked)
      { this.player.x += this.lockedTo.deltaX;
        this.player.y = this.lockedTo.y - 48;
          if (this.player.body.velocity.x !== 0)
          { this.player.body.velocity.y = 0; }
      }
      if (this.willJump)
      { this.willJump = false;
        if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
        { //  If the platform is moving up we add its velocity to the players jump
          this.player.body.velocity.y = -400 + (this.lockedTo.deltaY * 10); }
          else
          { this.player.body.velocity.y = -400; }
          this.jumpTimer = this.time.time + 750;
      }
      if (this.wasLocked)
      { this.wasLocked = false;
        this.lockedTo.playerLocked = false;
        this.lockedTo = null;}
    },

  update: function() {
  // PLAYER 1
    // Player1 Physics
    this.physics.arcade.collide(this.player, this.stationary);
    this.physics.arcade.collide(this.player, this.ground);
    this.physics.arcade.collide(this.player, this.shark);
    this.physics.arcade.collide(this.player, this.floatingPlatforms, this.customSep, null, this);

    //  Do this AFTER the collide check, or we won't have blocked/touching set
    var standing = this.player.body.blocked.down || this.player.body.touching.down || this.locked;

    var flipFlop;

    this.player.body.velocity.x = 0;


    if (this.cursors.left.isDown)
      { this.player.body.velocity.x = -150;
        if (this.facing !== 'left')
        { this.player.play('left');
          this.facing = 'left'; }
      }
      else if (this.cursors.right.isDown)
      { this.player.body.velocity.x = 150;
        if (this.facing !== 'right')
        { this.player.play('right');
          this.facing = 'right'; }
      }
      else {
       if (this.facing !== 'idle')
        { this.player.animations.stop();
          if (this.facing === 'left') { this.player.frame = 0; }
          else { this.player.frame = 5; }
        this.facing = 'idle';
        }
      }

      if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer)
      {
        if (this.locked)
        { this.cancelLock(); }
      }

      if (this.locked)
      { this.checkLock();}

      if (standing) {
        this.jumpCount = 0;
        // console.log(this.jumpCount)
      }

    // Jump and double-jump
    this.jumpKey.onDown.add(jumpCheck, this);

    // Decrement player playerHealth when colliding with shark
    game.physics.arcade.overlap(this.player, this.shark, lowerHealth, null, this);

    // Function: Lower player playerHealth, kill player
    function lowerHealth(player, shark) {
      this.playerHealth -= 10;
      this.playerHealthText.text = 'Health:' + this.playerHealth
      if (this.playerHealth === 0) {
        player.kill()
      }
    }

    // Add bubbles
    Bubble();

  }   //end of update
}

jumpCheck = function () {
  if (this.jumpCount < 2) {
    this.player.body.velocity.y = -350;
    this.jumpCount ++;
  }
  // console.log("Jumps:",this.jumpCount)
}

Baddie = function (game, x, y, key, group) {
  if (typeof group === 'undefined') {
    group = game.world; }

  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.immovable = true;
  this.playerLocked = false;
  group.add(this);
};

// Adding Bubbles
Bubble = function () {
  for (var i = 0; i < 1; i ++) {
    this.bubbles = game.add.group();
    this.bubbles.enableBody = true;
    var x = Math.random()*1600;
    this.bubble = this.bubbles.create(x, 900, 'bubble');
    this.bubble.body.gravity.y = -700;
    }
  }

// Adding Moving Platforms
MovingPlatform = function (game, x, y, key, group) {
  if (typeof group === 'undefined') { group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.immovable = true;
  this.playerLocked = false;
  group.add(this);
};


// Prototypes
Baddie.prototype = Object.create(Phaser.Sprite.prototype);
Baddie.prototype.constructor = Baddie;

Baddie.prototype.addMotionPath = function (motionPath) {
  this.tweenX = this.game.add.tween(this.body);
  this.tweenY = this.game.add.tween(this.body);

  for (var i = 0; i < motionPath.length; i++)
  { this.tweenX.to( { x: motionPath[i].x },
  motionPath[i].xSpeed, motionPath[i].xEase);
    this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
  }
  this.tweenX.loop();
  this.tweenY.loop();
};

Baddie.prototype.start = function () {
  this.tweenX.start();
  this.tweenY.start();
};

Baddie.prototype.stop = function () {
  this.tweenX.stop();
  this.tweenY.stop();
};

MovingPlatform.prototype = Object.create(Phaser.Sprite.prototype);
MovingPlatform.prototype.constructor = MovingPlatform;

MovingPlatform.prototype.addMotionPath = function (motionPath) {
    this.tweenX = this.game.add.tween(this.body);
    this.tweenY = this.game.add.tween(this.body);
    for (var i = 0; i < motionPath.length; i++)
    {
        this.tweenX.to( { x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
        this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
    }
    this.tweenX.loop();
    this.tweenY.loop();
};

MovingPlatform.prototype.start = function () {
    this.tweenX.start();
    this.tweenY.start();
};

MovingPlatform.prototype.stop = function () {
    this.tweenX.stop();
    this.tweenY.stop();
};

// Call game
game.state.add('Game', PhaserGame, true);
