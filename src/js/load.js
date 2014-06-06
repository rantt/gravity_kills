var Game = {
  w: 800,
  h: 600
};

Game.Boot = function(game) {
  this.game = game;
};

Game.Boot.prototype = {
  preload: function() {
		// this.game.stage.backgroundColor = '#dedede'; //light gray
		// this.game.stage.backgroundColor = '#8B668B'; //plum
		// this.game.stage.backgroundColor = '#5F9F9F'; //cadet blue
		// this.game.stage.backgroundColor = '#39B7CD'; //nypd
		// this.game.stage.backgroundColor = '#50A6C2'; //lake
		// this.game.stage.backgroundColor = '#fff'; //lake
		this.game.stage.backgroundColor = '#b4b4b4'; //dark gray

		this.game.load.image('loading', 'assets/loading.png');
		this.game.load.image('title', 'assets/title.png');
		this.game.load.image('instructions', 'assets/instructions.png');
  },
  create: function() {
   this.game.state.start('Load');
  }
};

Game.Load = function(game) {
  this.game = game;
};

Game.Load.prototype = {
  preload: function() {

    //Loading Screen Message/bar
    var loadingText = this.game.add.text(Game.w/2, Game.h/2, 'Loading...', { font: '30px Helvetica', fill: '#000' });
  	loadingText.anchor.setTo(0.5, 0.5);
  	var preloading = this.game.add.sprite(Game.w/2-64, Game.h/2+50, 'loading');
  	this.game.load.setPreloadSprite(preloading);

    this.game.load.image('pixel','assets/pixel.png');
    this.game.load.atlasXML('portal', 'assets/portal_sheet.png', 'assets/portal_sheet.xml');
    this.game.load.atlasXML('cells', 'assets/cell_sheet.png', 'assets/cell_sheet.xml');
    this.game.load.atlasXML('player','assets/robot_sheet.png','assets/robot_sheet.xml');

    this.game.load.tilemap('level1','levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2','levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level3','levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level4','levels/level4.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level5','levels/level5.json', null, Phaser.Tilemap.TILED_JSON);
    // this.game.load.tilemap('level6','levels/level6.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level7','levels/level7.json', null, Phaser.Tilemap.TILED_JSON);
    // this.game.load.tilemap('level8','levels/level8.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('the_end','levels/the_end.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('the_impossible','levels/the_impossible.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/sprites.png');
    this.game.load.image('mobs', 'assets/mobs.png');
    this.game.load.image('spike','assets/spike.png');
    this.game.load.image('twitter','assets/twitter.png');

    this.game.load.atlasXML('dpad','assets/dpad_sheet.png','assets/dpad_sheet.xml');

    // Music Track
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) === false ) {
      this.game.load.audio('music','assets/audio/CausticChip16_0.mp3');
    }
    this.game.load.audio('jump_up', 'assets/audio/jump_up.wav');
    this.game.load.audio('jump_down', 'assets/audio/jump_down.wav');
    this.game.load.audio('player_dead', 'assets/audio/player_dead.wav');
    this.game.load.audio('portal_up', 'assets/audio/portal_up.wav');
    this.game.load.audio('power_up', 'assets/audio/powerup.wav');

  },
  create: function() {
    this.game.state.start('Menu');
  }
};
