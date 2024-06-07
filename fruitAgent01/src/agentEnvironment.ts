import * as tf from "@tensorflow/tfjs";
import { Agent } from "./agent";

export class AgentEnvironment {
  private agent: Agent;
  private model: tf.Sequential;
  private optimizer: tf.Optimizer;

  constructor(agent: Agent) {
    this.agent = agent;
    this.model = this.createModel();
    this.optimizer = tf.train.adam();
  }

  private createModel(): tf.Sequential {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 256,
        activation: "relu",
        inputShape: [this.agent.visionLineCount],
      })
    );
    model.add(tf.layers.dense({ units: 128, activation: "relu" }));
    model.add(tf.layers.dense({ units: 4, activation: "softmax" })); // 4 outputs: left, right, forward, backward
    return model;
  }

  public async trainStep(): Promise<void> {
    const state = this.getVisionState();
    const action = this.chooseAction(state);
    const reward = this.performAction(action);
    const nextState = this.getVisionState();

    // Store this transition in memory (state, action, reward, nextState)
    // Assuming you have a method to handle memory storage

    // Sample random batch from memory to train
    const { states, actions, rewards, nextStates } = this.sampleFromMemory();

    // Calculate target Q-values
    const targetQs = rewards.map((r, i) => {
      const nextStateSlice = nextStates.slice(i, 1); // Slice out the i-th state
      const predictedQs = this.model.predict(nextStateSlice) as tf.Tensor;
      return r + 0.99 * Math.max(...predictedQs.dataSync());
    });

    // Train the model
    const withGradient = tf.tidy(() => {
      const qs = this.model.predict(states) as tf.Tensor;
      const qsArray = qs.dataSync();
      actions.forEach((action, index) => {
        qsArray[index * 4 + action] = targetQs[index];
      });
      return {
        qs: tf.tensor(qsArray, qs.shape),
        targetQs: tf.tensor(targetQs),
      };
    });

    const lossFunction = () =>
      tf.scalar(
        tf
          .mean(
            tf.losses.meanSquaredError(withGradient.targetQs, withGradient.qs)
          )
          .dataSync()[0]
      );
    await this.optimizer.minimize(lossFunction);
  }

  private chooseAction(state: number[]): number {
    if (Math.random() < 0.1) {
      // Epsilon-greedy policy
      return Math.floor(Math.random() * 4);
    } else {
      const qs = this.model.predict(tf.tensor2d([state])) as tf.Tensor;
      return qs.argMax(-1).dataSync()[0];
    }
  }

  private performAction(action: number): number {
    // Perform the action using the agent and return the reward
    this.agent.takeAction(action, true);
    return this.calculateReward();
  }

  private calculateReward(): number {
    // Calculate and return the reward after taking an action
    return this.agent.calculateReward();
  }

  private getVisionState(): number[] {
    // Enhanced state representation
    const distances = this.getDistancesToPoints(); // implemented method
    const directionToNearestPoint = this.getDirectionToNearestPoint(); // implemented method
    return [...distances, directionToNearestPoint];
  }

  private getDistancesToPoints(): number[] {
    // Implementation to get distances to points
    return this.agent.sensorData.map(
      (sensor: { distance: number }) => sensor.distance
    );
  }

  private getDirectionToNearestPoint(): number {
    // Implementation to get direction to the nearest point
    const sensorData = this.agent.sensorData;
    const nearestSensor = sensorData.reduce(
      (
        prev: { distance: number; direction: number },
        curr: { distance: number; direction: number }
      ) => (prev.distance < curr.distance ? prev : curr)
    );
    return nearestSensor.direction;
  }

  private sampleFromMemory(): {
    states: tf.Tensor;
    actions: number[];
    rewards: number[];
    nextStates: tf.Tensor;
  } {
    // Sample a batch from the stored transitions
    // This is a placeholder, implement according to your memory storage
    return {
      states: tf.tensor2d([]),
      actions: [],
      rewards: [],
      nextStates: tf.tensor2d([]),
    };
  }
}
