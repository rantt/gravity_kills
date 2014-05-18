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
        var text = this.game.add.text(Game.w/2, Game.h/2+75, '~click to start~', { font: '30px Helvetica', fill: '#fff' });
        text.anchor.setTo(0.5, 0.5);

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
