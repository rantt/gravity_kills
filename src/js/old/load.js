Game = {};

var w = 800;
var h = 600;

Game.Boot = function(game) {
  this.game = game;
}

Game.Boot.prototype = {
  preload: function() {
		this.game.stage.backgroundColor = '#FFF';
		this.game.load.image('loading', 'assets/loading.png');
		this.game.load.image('title', 'assets/title.png');
		this.game.load.image('instructions', 'assets/instructions.png');
  },
  create: function() {
   this.game.state.start('Load');
  }
}

Game.Load = function(game) {
  this.game = game;
}

Game.Load.prototype = {
  preload: function() {

    //Loading Screen Message/bar
    loading_text = this.game.add.text(w/2, h/2, 'Loading...', { font: '30px Helvetica', fill: '#000' });
  	loading_text.anchor.setTo(0.5, 0.5);
  	preloading = this.game.add.sprite(w/2-64, h/2+50, 'loading');
  	this.game.load.setPreloadSprite(preloading);

    // Music Track
    // this.game.load.audio('music','soundtrack.mp3');

  },
  create: function() {
    this.game.state.start('Menu');
  }
}
