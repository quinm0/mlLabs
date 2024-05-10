import { fabric } from 'fabric';

export class Agent extends fabric.Circle {
  // Negitive points for the agent if it tries to set angle numbers
  // outside of the 0 to 360 range because it's not realistic
  angleGreaterThan360 = 0;
  angleLessThan0 = 0;

  static readonly stepSpeed = 100;

  constructor() {
    super({
      radius: 10,
      fill: '#ff5724',
      angle: 0,
      left: 100,
      top: 100,
    });
  }

  animateSetAngle(angle: number) {
    // angle is max 360, so we need to normalize the direction
    // to be between 0 and 360
    angle = angle % 360;

    // if the angle is greater than 360, count how many times
    // it is greater than 360
    if (angle > 360) {
      this.angleGreaterThan360++;
    }

    // if the angle is less than 0, count how many times
    // it is less than 0
    if (angle < 0) {
      this.angleLessThan0++;
      return;
    }

    this.animate('angle', angle);
  }

  goForward() {
    if (!this.left || !this.top || !this.angle) {
      throw new Error(
        'Agent needs to have left, top, and angle set before moving'
      );
    }

    this.animate(
      'left',
      this.left + Math.cos((this.angle * Math.PI) / 180) * Agent.stepSpeed
    );
    this.animate(
      'top',
      this.top + Math.sin((this.angle * Math.PI) / 180) * Agent.stepSpeed
    );
  }
}
