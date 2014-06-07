/*global Game*/
Game.Menu = function(game){
  this.game = game;
};

Game.Menu.prototype =  {
    create: function() {

        this.title = this.game.add.sprite(Game.w/2,Game.h/2-100,'title');
        this.title.anchor.setTo(0.5,0.5);

        this.instructions = this.game.add.sprite(Game.w/2+200,200,'instructions');
        this.instructions.scale.x = 0.5;
        this.instructions.scale.y = 0.5;

        // Start Message

    // var loadingText = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia', 'Loading...', 32);
        var text = this.game.add.bitmapText(Game.w/2, Game.h/2+75, 'minecraftia', '~click to start~', 32);
        text.x = this.game.width / 2 - text.textWidth / 2;
        // text.anchor.setTo(0.5, 0.5);

    },
    update: function() {
      
      // var t = this.game.add.tween(this.title).to({angle:360},10);
      // t.loop(true).start();
      this.title.rotation += 0.02;
      //Click to Start
      if (this.game.input.activePointer.isDown){
        this.game.state.start('Play');
      }
    }
};
