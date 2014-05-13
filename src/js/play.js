/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */

// // Choose Random integer in a range
// function rand (min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

var deaths = 0;
var won = false;
// var test;
var muteKey;
var musicOn = true;
var rKey;
var wKey;
var aKey;
var sKey;
var dKey;
var spaceKey;
var cursors;
var facing = '';
var orientation = 'down';
var hozMove = 200; // The amount to move horizontally
var gravity = 750; // The amount to move vertically (when 'jumping')
var mobSpeed = 100;

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  create: function() {
    this.game.physics.startSystem(Phaser.ARCADE);

    this.level = 'level1';
    this.cellCount = 0;
    this.cellTotal = 0;

    // this.player = this.game.add.sprite(Game.w/2, Game.h/2, 'player');

    this.labels = this.game.add.group();
    this.portals = this.game.add.group();
    this.portals.enableBody = true;
    this.portals.immovable = true;

    this.cells = this.game.add.group();
    this.cells.enableBody = true;

    this.player = this.game.add.sprite(75, Game.h-40, 'player');
    this.player.anchor.setTo(0.5,0.5);

    this.player.animations.add('left',[1,2,1,3],10,true);
    this.player.animations.add('right',[5,6,5,7],10,true);


    this.game.physics.enable(this.player);

    this.player.body.collideWorldBounds = true;


    this.mobs = this.game.add.group();
    this.mobs.enableBody = true;

    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    cursors = this.game.input.keyboard.createCursorKeys();

    this.emitter = this.game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);

    // Music
    this.music = this.game.add.audio('music');
    this.music.override = true;
    this.music.addMarker('intro',1,7,1,false);
    this.music.addMarker('main',8,80,1,true);
    // this.music.play('intro');
    this.music.play('main',0,1,true);
    // this.music.play('',0,1,true);


    this.playerDeadSnd = this.game.add.sound('player_dead');
    this.playerDeadSnd.volume = 0.2;

    this.jumpUpSnd = this.game.add.sound('jump_up');
    this.jumpUpSnd.volume = 0.2;

    this.jumpDownSnd = this.game.add.sound('jump_down');
    this.jumpDownSnd.volume = 0.2;

    this.portalUpSnd = this.game.add.sound('portal_up');
    this.portalUpSnd.volume = 0.2;

    this.powerUpSnd = this.game.add.sound('power_up');
    this.powerUpSnd.volume = 0.2;

    //Setup WASD and extra keys
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
    spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    muteKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M);

    this.restartText = this.game.add.text(Game.w/2, Game.h/2, '', { font: '32px Helvetica', fill: '#ffffff', align: 'center'});
    this.restartText.font = 'Helvetica';
    this.restartText.anchor.set(0.5);
    this.restartText.fixedToCamera = true;
    this.restartText.visible = false;

    this.loadLevel();
  },
  clearMap: function() {
    this.portals.callAll('kill');
    this.mobs.callAll('kill');

    this.labels.forEach(function(l){
      l.message.destroy();
      l.destroy();
    }, this);

    this.respawnPlayer();
    if (this.layer) {
      this.layer.destroy();
    }

  },
  loadLevel: function() {

    this.clearMap();

    var msg;

    if (this.level === 'the_end') {
      won = true;
      msg =  'Your Died: ' + deaths + '\n';
      msg +=  'Press R to restart.\n';
      msg += '~Share your score on twitter!~\n';
      this.restartText.setText(msg);
      this.restartText.visible = true;
      this.twitterButton = this.game.add.button(Game.w/2, Game.h/2+110,'twitter', this.twitter, this);
      this.twitterButton.anchor.setTo(0.5,0.5);
      this.twitterButton.fixedToCamera = true;
    }else if (this.level === 'the_impossible') {
      won = false;
      this.restartText.visible = false;
      this.twitterButton.visible = false;
    }else if (this.level === undefined) {
      won = true;
      msg = 'Congratulations! You Beat the Impossible Level.\n';
      msg +=  'Press R to restart.\n';
      msg +=  'You Died: ' + deaths + '\n';
      this.restartText.setText(msg);
      this.restartText.visible = true;
      this.twitterButton = this.game.add.button(Game.w/2, Game.h/2+110,'twitter', this.twitter, this);
      this.twitterButton.anchor.setTo(0.5,0.5);
      this.twitterButton.fixedToCamera = true;
    }


    this.map = this.game.add.tilemap(this.level);
    this.map.addTilesetImage('tiles','tiles');
    this.map.addTilesetImage('mobs','mobs');
    this.map.addTilesetImage('cells','cells');
    this.map.setCollision(0);
    this.map.setCollision(3);
    this.map.setTileIndexCallback(2, this.playerDead, this);
    this.layer = this.map.createLayer('layer');
    this.map.createFromObjects('objects', 4, 'portal', 0, true, false, this.portals);
    this.map.createFromObjects('objects', 7, 'cells', 0, true, false, this.cells);
    this.map.createFromObjects('objects', 1, '', 0, true, false, this.labels);
    this.map.createFromObjects('objects', 5, 'spike', 0, true, false, this.mobs);
    this.map.createFromObjects('objects', 6, 'spike', 0, true, false, this.mobs);
    this.layer.resizeWorld();

    this.locked = true;

    this.loadObjects();

  },
  loadObjects: function() {
    this.cells.callAll('animations.add', 'animations', 'spin', [0,1,2,3], 5, true);
    this.cells.callAll('animations.play', 'animations', 'spin');
    this.cells.forEach(function(c){
      this.cellTotal += 1;
      c.alive = true;
    },this);

    this.portals.forEach(function(p){
      p.anchor.setTo(0.5,0.5);
      p.y += p.height/2;
      var t = this.game.add.tween(p).to({y: '-5'}, 500).to({y:'+5'}, 500);
      t.loop(true).start();
    }, this);

    this.labels.forEach(function(l){
      l.message = this.game.add.text(l.x, l.y, l.text, { font: '21px Helvetica', fill: '#FFFFFF' });
      l.message.anchor.setTo(0.5, 1);
      l.message.x += l.width/2;
      l.message.y += l.height/2;
      l.message.alive = true;
    }, this);

    this.mobs.forEach(function(mob){
      if (mob.move === 'h') {
        mob.body.velocity.x = mobSpeed;
        mob.direction = 1;
      }
      else if (mob.move === 'v') {
        mob.body.velocity.y = mobSpeed;
        mob.direction = 1;
      }
    }, this);

    this.portals.forEach(function(p){
      p.anchor.setTo(0.5,0.5);
      p.x += p.width/2;
      p.y += p.width;
    }, this);
  },
  nextLevel: function(player,portal) {
    if (this.locked !== true) {
      return;
    }

    if (this.cellCount === this.cellTotal){
      this.locked = false;

      this.cellCount = 0;
      this.cellTotal = 0;

      this.level = portal.destination;

      var t = this.game.add.tween(this.player.scale).to({x:0, y:0}, 200).start();
      t.onComplete.add(this.loadLevel, this);
    }

  },
  pickUpCell: function(player, cell) {
    this.powerUpSnd.play();
    cell.destroy();
    this.cellCount += 1;
  },
  update: function() {
    this.game.physics.arcade.collide(this.layer, this.player);
    // this.game.physics.arcade.overlap(this.player, this.portals, this.nextLevel, null, this);
    this.game.physics.arcade.overlap(this.player, this.cells, this.pickUpCell, null, this);
    this.game.physics.arcade.overlap(this.player, this.portals, this.nextLevel, null, this);

    this.game.physics.arcade.overlap(this.mobs, this.layer, this.mobBounce, null, this);
    this.game.physics.arcade.overlap(this.mobs, this.player, this.playerDead, null, this);

    this.player.body.velocity.x = 0;

    if (this.cellCount === this.cellTotal) {
      this.portals.forEach(function(p){
        if (p.frame === 0){
          this.portalUpSnd.play();
        }
        p.frame = 1;
      }, this);
    }

        // Check if the left arrow key is being pressed
    if (cursors.left.isDown || aKey.isDown)
    {
      this.player.body.velocity.x = -hozMove;

      // Check if 'facing' is not 'left'
      if (facing !== 'left')
      {
        // Set 'facing' to 'left'
          this.player.animations.play('left');
        facing = 'left';
      }

    }
    // Check if the right arrow key is being pressed
    else if (cursors.right.isDown || dKey.isDown)
    {
      // Set the 'player' sprite's x velocity to a positive number:
      //  have it move right on the screen.
      this.player.body.velocity.x = hozMove;

      // Check if 'facing' is not 'right'
      if (facing !== 'right')
      {
        this.player.animations.play('right');
        facing = 'right';
      }
    }
    else {
      if (facing !== 'idle')
      {
        this.player.animations.stop();
        if (facing === 'left') {
          this.player.frame = 0;
        }else{
          this.player.frame = 4;
        }
        facing = 'idle';
      }
    }

    cursors.up.onDown.add(this.setGravityNormal, this);
    wKey.onDown.add(this.setGravityNormal, this);

    cursors.down.onDown.add(this.setGravityReverse, this);
    sKey.onDown.add(this.setGravityReverse, this);

    spaceKey.onDown.add(this.toggleGravity, this);

    rKey.onDown.add(this.restartGame, this);
    // if (rKey.isDown) {
    //   this.restartGame();
    // }

    // // Toggle Music
    muteKey.onDown.add(this.toggleMute, this);

  },
  restartGame: function() {
    if (won === true) {
      won = false;
      deaths = 0;
      this.locked = false;
      this.cells.callAll('kill');

      //Reinitialize cell group
      this.cells = this.game.add.group();
      this.cells.enableBody = true;

      this.restartText.visible = false;
      this.twitterButton.visible = false;

      this.cellCount = 0;
      this.cellTotal = 0;

      this.level = 'level1';

      this.loadLevel();
    }
  },
  mobBounce: function(mob, layer){
		if (mob.move === 'h') {
			if (mob.direction < 0)
      {
				mob.body.velocity.x = mobSpeed;
      }
			else {
				mob.body.velocity.x = -mobSpeed;
      }
		}
		else if (mob.move === 'v') {
			if (mob.direction < 0) {
				mob.body.velocity.y = mobSpeed;
      }
			else {
				mob.body.velocity.y = -mobSpeed;
      }
		}

		mob.direction = mob.direction * -1;
  },
  setGravityNormal: function() {
    //reverse Gravity and flip player upside down
    this.jumpUpSnd.play();
    this.player.body.gravity.y = -gravity;
    this.game.add.tween(this.player).to({angle:180},100).start();
    this.player.scale.x = -1;
    orientation = 'up';
  },
  setGravityReverse: function() {
    this.jumpDownSnd.play();
    this.player.body.gravity.y = gravity;
    this.game.add.tween(this.player).to({angle:0},100).start();
    orientation = 'down';
    this.player.scale.x = 1;
  },
  toggleGravity: function() {
    if (orientation === 'down'){
      this.setGravityNormal();
    }
    else {
      this.setGravityReverse();
    }
  },
  playerDead: function() {
    this.playerDeadSnd.play();
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.start(true, 1000, null, 64);

    deaths += 1;

    this.respawnPlayer();
  },
  respawnPlayer: function() {
    this.player.frame = 0;
    facing = '';
    orientation = 'down';
    this.game.add.tween(this.player.scale).to({x:1, y:1}, 200).start();
    if (this.player.body.gravity.y === -gravity) {
      this.game.add.tween(this.player).to({angle:0},1).start();
      this.player.body.gravity.y = gravity;
    }
    this.player.anchor.setTo(0.5,0.5);

    this.player.reset(75, Game.h-40);
  },
  twitter: function() {
    window.open('http://twitter.com/share?text=I+just+beat+Gravity+Kills!+and+only+died+'+deaths+'+times+See+if+you+can+beat+it+at&via=rantt_&url=http://www.divideby5.com/games/gravity_kills/', '_blank');
  },
  toggleMute: function() {
    if (musicOn === true) {
      musicOn = false;
      this.music.volume = 0;
    }else {
      musicOn = true;
      this.music.volume = 1;
    }
  },
  render: function() {
    this.game.debug.text('level: ' + this.level, 32, 32);
    this.game.debug.text('deaths: ' + deaths, 32, 64);
    this.game.debug.text('cells picked up: ' + this.cells.countDead, 32, 96);
    this.game.debug.text('cells total: ' + this.cellTotal, 32, 114);
  }

};
