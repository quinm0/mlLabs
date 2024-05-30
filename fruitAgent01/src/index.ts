import Phaser from "phaser";
import listenForRefresh from "./websocketListener";
listenForRefresh();

class SimpleGame extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({
      key: SimpleGame.name,
    });
  }

  preload() {
    this.load.image("player", "user.png");
  }

  create() {
    this.player = this.physics.add.sprite(200, 100, "player");
    this.cursors = this.input.keyboard?.createCursorKeys()!;
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.cursors.space.isDown) {
      this.player.setScale(this.player.scale * 1.1);
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "content",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: SimpleGame,
};

const game = new Phaser.Game(config);
