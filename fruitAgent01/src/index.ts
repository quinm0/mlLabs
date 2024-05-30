import Phaser from "phaser";
import listenForRefresh from "./websocketListener";
import { Agent } from "./agent";
listenForRefresh();

class SimpleGame extends Phaser.Scene {
  private agent!: Agent;

  constructor() {
    super({
      key: SimpleGame.name,
    });
  }

  preload() {}

  create() {
    this.agent = new Agent(this, 400, 300);
  }

  update() {
    this.agent.update();
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

      debug: true,
    },
  },
  scene: SimpleGame,
};

const game = new Phaser.Game(config);
