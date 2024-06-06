import Phaser from "phaser";
import listenForRefresh from "./websocketListener";
import { Agent } from "./agent";
import { Point } from "./point";
listenForRefresh();

class SimpleGame extends Phaser.Scene {
  private agent!: Agent;
  private points!: Phaser.Physics.Arcade.Group;

  constructor() {
    super({
      key: SimpleGame.name,
    });
  }

  preload() {}

  create() {
    this.points = this.physics.add.group();
    this.agent = new Agent(this, 400, 300);

    // Create 10 random points randomly on the screen
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const point = new Point(this, x, y);
      this.points.add(point);
    }

    this.physics.add.overlap(
      this.agent,
      this.points,
      (a, b) => {
        if (a instanceof Agent && b instanceof Point) {
          this.handlePlayerPointCollision(a, b);
        }
      },
      undefined,
      this
    );
  }

  update() {
    this.agent.update();
  }

  handlePlayerPointCollision(player: Agent, point: Point) {
    point.destroy();
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

new Phaser.Game(config);
