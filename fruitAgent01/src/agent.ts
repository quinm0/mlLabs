import { fabric } from 'fabric';

export class Agent extends fabric.Group {
  // Negitive points for the agent if it tries to set angle numbers
  // outside of the 0 to 360 range because it's not realistic
  angleGreaterThan360 = 0;
  angleLessThan0 = 0;

  readonly stepSpeed = 10;
  readonly bodyCircle = new fabric.Circle({
    radius: 20,
    fill: 'orange',
  });
  readonly groupCenterPoint = new fabric.Circle({
    radius: 2,
    fill: 'red',
  });

  readonly renderBodies = [this.groupCenterPoint, this.bodyCircle];

  constructor() {
    super([], {
      left: 100,
      top: 100,
    });

    // for (const body of this.renderBodies) {
    for (const body of this.renderBodies) {
      this.addWithUpdate(body);
    }

    // this.angle = 0;
  }

  tick() {
    this.groupCenterPoint.setPositionByOrigin(
      this.getCenterPoint(),
      'left',
      'top'
    );

    console.log(this.getCenterPoint());

    // this.goForward();
  }

  // animateSetAngle(angle: number) {
  //   // angle is max 360, so we need to normalize the direction
  //   // to be between 0 and 360
  //   angle = angle % 360;

  //   // if the angle is greater than 360, count how many times
  //   // it is greater than 360
  //   if (angle > 360) {
  //     this.angleGreaterThan360++;
  //   }

  //   // if the angle is less than 0, count how many times
  //   // it is less than 0
  //   if (angle < 0) {
  //     this.angleLessThan0++;
  //     return;
  //   }

  //   this.animate('angle', angle);
  // }

  goForward() {
    const { x, y } = this.getCenterPoint();
    const angle = this.get('angle') as number;

    console.log('angle', angle);

    const xStep = Math.cos((angle * Math.PI) / 180) * this.stepSpeed;
    const yStep = Math.sin((angle * Math.PI) / 180) * this.stepSpeed;

    this.setPositionByOrigin(
      new fabric.Point(x + xStep, y + yStep),
      'center',
      'center'
    );
    console.log('left', this.left);
  }
}
