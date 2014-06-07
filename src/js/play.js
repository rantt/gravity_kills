/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */

// // Choose Random integer in a range
// function rand (min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

var mobile = false;
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
var facing = 'right';
// var this.orientation = 'down';
var hozMove = 200; // The amount to move horizontally
var gravity = 750; // The amount to move vertically (when 'jumping')
var mobSpeed = 100;

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  create: function() {

    this.game.physics.startSystem(Phaser.ARCADE);
    // this.game.physics.startSystem(Phaser.Physics.P2JS);
    // this.game.physics.startSystem(Phaser.Physics.NINJA);

    this.level = 'level1';
    // this.level = 'level8';
    this.cellCount = 0;
    this.cellTotal = 0;

    this.labels = this.game.add.group();
    this.portals = this.game.add.group();
    this.portals.enableBody = true;
    this.portals.immovable = true;

    this.cells = this.game.add.group();
    this.cells.enableBody = true;


    // this.player = this.game.add.sprite(75, Game.h-40, 'player');
    this.player = this.game.add.sprite(75, Game.h-50, 'player');
    this.player.anchor.setTo(0.5,0.5);

    this.player.animations.add('left',[1,2,1,3],10,true);
    this.player.animations.add('right',[5,6,5,7],10,true);

    this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
    // this.game.physics.arcade.enable(this.player);
    // player.body.setSize(20, 32, 5, 16);

    // this.player.body.setSize(28,45,7,16);
    this.player.body.collideWorldBounds = true;
    this.player.body.maxVelocity.setTo(700, 700);



    this.mobs = this.game.add.group();
    this.mobs.enableBody = true;

    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

    cursors = this.game.input.keyboard.createCursorKeys();

    this.emitter = this.game.add.emitter(0, 0, 200);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);



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


    // var loadingText = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia', 'Loading...', 32);
    // this.restartText = this.game.add.text(Game.w/2, Game.h/2, '', { font: '32px Helvetica', fill: '#ffffff', align: 'center'});
    // this.restartText.font = 'Helvetica';
    // this.restartText.anchor.set(0.5);
    this.restartText = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia','',21);
    this.restartText.x = this.game.width / 2 - this.restartText.textWidth / 2;

    this.restartText.fixedToCamera = true;
    this.restartText.visible = false;

    
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
       mobile = true;
       this.dpad = this.game.add.group();
    }else {
      // Music
      this.music = this.game.add.audio('music');
      this.music.override = true;
      this.music.addMarker('intro',1,7,1,false);
      this.music.addMarker('main',8,80,1,true);
      this.music.play('main',0,1,true);
      // this.music.stop();
      // this.music.play('intro');
      // this.music.play('',0,1,true);
    }


    this.loadLevel();

  },
  
  clearMap: function() {
    this.portals.callAll('kill');
    this.mobs.callAll('kill');

    if (mobile){
      this.dpad.callAll('kill');
    }

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
      this.restartText.x = this.game.width / 2 - this.restartText.textWidth / 2;
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
      this.restartText.x = this.game.width / 2 - this.restartText.textWidth / 2;
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
    // this.layer.debug;
    this.map.createFromObjects('objects', 4, 'portal', 0, true, false, this.portals);
    this.map.createFromObjects('objects', 7, 'cells', 0, true, false, this.cells);
    this.map.createFromObjects('objects', 1, '', 0, true, false, this.labels);
    this.map.createFromObjects('objects', 5, 'spike', 0, true, false, this.mobs);
    this.map.createFromObjects('objects', 6, 'spike', 0, true, false, this.mobs);
    this.layer.resizeWorld();
    // this.game.physics.p2.convertTilemap(this.map, this.layer);

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



    // var loadingText = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia', 'Loading...', 32);
    this.labels.forEach(function(l){
      // l.message = this.game.add.text(l.x, l.y, l.text, { font: '21px Helvetica', fill: '#FFFFFF' });
      l.message = this.game.add.bitmapText(l.x, l.y, 'minecraftia', l.text, 21);
      // l.message.anchor.setTo(0.5, 1);
      l.message.x += l.width/2;
      l.message.x = this.game.width / 2 - l.message.textWidth / 2;
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

    if (mobile) {
      this.dpad = this.game.add.group();
      this.left = this.game.add.sprite(40, Game.h-40, 'dpad',1);
      this.dpad.add(this.left);

      this.right = this.game.add.sprite(120, Game.h-40, 'dpad',2);
      this.dpad.add(this.right);
       
      this.toggleButton = this.game.add.sprite(Game.w-60, Game.h-40, 'dpad',3);
      this.dpad.add(this.toggleButton);

      this.dpad.forEach(function(d) {
        d.fixedToCamera = true;
        d.inputEnabled = true;
        d.anchor.setTo(0.5,0.5);
      }, this);
    }


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
    if (this.cellCount === this.cellTotal) {
      this.portals.forEach(function(p){
        if (p.frame === 0){
          this.portalUpSnd.play();
        }
        p.frame = 1;
      }, this);
    }
  },
  onGround: function() {
    if (this.player.body.blocked.up || this.player.body.blocked.down) {
      return true;
    } else {
      return false;
    }
  },
  update: function() {
    // this.game.physics.arcade.collide(this.layer, this.player);
    this.game.physics.arcade.collide(this.player, this.layer);
    // this.game.physics.arcade.overlap(this.player, this.layer);
    this.game.physics.arcade.overlap(this.player, this.cells, this.pickUpCell, null, this);
    this.game.physics.arcade.overlap(this.player, this.portals, this.nextLevel, null, this);
    this.game.physics.arcade.overlap(this.mobs, this.layer, this.mobBounce, null, this);
    this.game.physics.arcade.overlap(this.mobs, this.player, this.playerDead, null, this);
    this.player.body.velocity.x = 0;


    if (mobile) {
      this.mobileMove();
    }else {
      this.browserMove();

      //Stop Walking animation when in the air
      if ((this.onGround() === false) && (facing !== 'idle')){
          if (facing === 'left') {
            this.player.frame = 0;
          }else{
            this.player.frame = 4;
          }
      }
    } 


  },
  browserMove: function() {
    if (cursors.left.isDown || aKey.isDown )
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

    // Toggle Music
    muteKey.onDown.add(this.toggleMute, this);
    rKey.onDown.add(this.restartGame, this);
  },
  mobileMove: function() {
    if (cursors.left.isDown || aKey.isDown || this.left.input.pointerDown(this.game.input.activePointer.id) )
    // if (cursors.left.isDown || aKey.isDown )
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
    else if (cursors.right.isDown || dKey.isDown || this.right.input.pointerDown(this.game.input.activePointer.id) )
    // else if (cursors.right.isDown || dKey.isDown)
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
    this.toggleButton.events.onInputDown.add(this.toggleGravity, this);
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
    if (this.orientation === 'down'){
      this.jumpUpSnd.play();
      this.player.body.gravity.y = -gravity;
      this.game.add.tween(this.player).to({angle:180},100).start();
      this.player.scale.x = -1;
      this.orientation = 'up';
    }
  },
  setGravityReverse: function() {
    if (this.orientation === 'up') {
      this.jumpDownSnd.play();
      this.player.body.gravity.y = gravity;
      this.game.add.tween(this.player).to({angle:0},100).start();
      this.orientation = 'down';
      this.player.scale.x = 1;
    }
  },
  toggleGravity: function() {
    if (this.orientation === 'down'){
      if (mobile){ 
        this.toggleButton.frame = 0;
      }
      this.setGravityNormal();
    }
    else {
      if (mobile){
        this.toggleButton.frame = 3;
      }
      this.setGravityReverse();
    }
  },
  playerDead: function() {
    this.playerDeadSnd.play();
    this.orientation = 'down';
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.start(true, 1000, null, 64);
    this.player.kill();

    deaths += 1;

    this.respawnPlayer();
  },
  respawnPlayer: function() {
    this.player.reset(75, Game.h - 50);

    this.player.frame = 0;
    facing = 'right';
    this.orientation = 'down';
    this.game.add.tween(this.player.scale).to({x:1, y:1}, 200).start();
    if (this.player.body.gravity.y === -gravity) {
      this.game.add.tween(this.player).to({angle:0},1).start();
    }
    this.player.body.gravity.y = gravity;
    this.player.anchor.setTo(0.5,0.5);

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
  // render: function() {
  //   // this.game.debug.text('level: ' + this.level, 32, 32);
  //
  //   // this.game.debug.text('touching: ' + this.toggleButton.input.pointerDown(this.game.input.activePointer.id), 32, 32);
  //   // this.game.debug.text('touching: ' + this.toggleButton.input.justPressed(this.game.input.activePointer.id,1), 32, 32);
  //   // this.game.debug.text('touching: ' + this.toggleButton.events.onInputDown(this.game.input.activePointer.id,1), 32, 32);
  //   // this.game.debug.text('touching: ' + this.toggleButton.events.onInputDown, 32, 32);
  //   // this.game.debug.text('deaths: ' + deaths, 32, 64);
  //   // this.game.debug.text('toggleReset' + toggleReset, 32, 64);
  //   // this.game.debug.text('cells picked up: ' + this.cells.countDead, 32, 96);
  //   // this.game.debug.text('cells total: ' + this.cellTotal, 32, 114);
  //   //  Just renders out the pointer data when you touch the canvas
  //   // this.game.debug.pointer(this.game.input.mousePointer);
  //   // this.game.debug.pointer(this.game.input.pointer1);
  //   // this.game.debug.pointer(this.game.input.pointer2);
  //   this.game.debug.text(this.game.time.physicsElapsed, 32, 32);
  //   this.game.debug.body(this.player);
  //   this.game.debug.bodyInfo(this.player, 16, 24);
  //            
  // }
  
};
