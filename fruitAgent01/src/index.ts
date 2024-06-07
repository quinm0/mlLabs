import * as tf from "@tensorflow/tfjs";
import Phaser from "phaser";
import listenForRefresh from "./websocketListener";
import { Agent } from "./agent";
import { Point } from "./point";
import { AgentEnvironment } from "./agentEnvironment"; // Import the AgentEnvironment class
import "@tensorflow/tfjs-backend-wasm";

listenForRefresh();

async function initializeTF() {
  try {
    await tf.setBackend("wasm");
    console.log("Using WASM backend");
  } catch (error) {
    console.error("Failed to set WASM backend:", error);
    await tf.setBackend("cpu"); // Fallback to CPU backend
    console.log("Using CPU backend");
  }
  await tf.ready(); // Ensure the backend is ready
}

class SimpleGame extends Phaser.Scene {
  private agent!: Agent;
  private points!: Phaser.Physics.Arcade.Group;
  private scoreboard!: Phaser.GameObjects.Text;
  private agentEnvironment!: AgentEnvironment; // Add this line
  private trainingActive: boolean = false; // Flag to control training

  private score = 0;

  constructor(key: string) {
    super({
      key: key,
    });
  }

  preload() {}

  create() {
    this.points = this.physics.add.group();
    this.agent = new Agent(this, 400, 300, undefined, {
      vision: true,
      data: true,
      console: false,
    });
    this.agentEnvironment = new AgentEnvironment(this.agent); // Initialize the AgentEnvironment
    this.scoreboard = this.add.text(10, 10, `Score: ${this.score}`);

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

    // Add keyboard listener for training toggle
    this.input.keyboard!.on("keydown-T", () => {
      this.trainingActive = !this.trainingActive;
      console.log(
        `Training is now ${this.trainingActive ? "active" : "inactive"}.`
      );
    });
  }

  update() {
    this.agent.update();
    this.scoreboard.setText(`Score: ${this.score}`);

    if (this.trainingActive) {
      this.agentEnvironment
        .trainStep()
        .then(() => {
          console.log("Training step completed");
        })
        .catch((error) => {
          console.error("Training step failed:", error);
        });
    }
  }

  handlePlayerPointCollision(player: Agent, point: Point) {
    point.destroy();
    this.score++;
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
  scene: [new SimpleGame("simulation1"), new SimpleGame("simulation2")],
};

initializeTF().then(() => {
  new Phaser.Game(config);
});
