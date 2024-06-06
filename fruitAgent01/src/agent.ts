export class Agent extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugVisionEnabled: boolean = true;
  public visionLinesState: { [direction: string]: boolean } = {};
  private currentAngle: number = 0;
  public visionLineCount: number = 5;
  private visionRadius: number = 100;
  private visionAngle: number = 90;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const textureKey = "playerCircle";
    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.fillCircle(25, 25, 25);
      graphics.generateTexture(textureKey, 50, 50);
      graphics.destroy();
    }

    super(scene, x, y, textureKey);
    this.cursors = scene.input.keyboard?.createCursorKeys()!;
    this.debugGraphics = scene.add.graphics();

    scene.physics.add.existing(this);
    scene.add.existing(this);
  }

  update(...args: any[]): void {
    if (this.cursors.left.isDown) {
      this.takeAction(180, true);
    }
    if (this.cursors.right.isDown) {
      this.takeAction(0, true);
    }
    if (this.cursors.up.isDown) {
      this.takeAction(270, true);
    }
    if (this.cursors.down.isDown) {
      this.takeAction(90, true);
    }

    this.updateVisionLogic();
    this.updateDebugVision();
  }

  toggleDebugVision(): void {
    this.debugVisionEnabled = !this.debugVisionEnabled;
    if (!this.debugVisionEnabled) {
      this.debugGraphics?.clear();
    }
  }

  setVisionAngle(degrees: number): void {
    this.visionAngle = degrees;
  }

  private updateVisionLogic(): void {
    const points = (this.scene as any).points.getChildren();
    const halfAngle = this.visionAngle / 2;
    const angleIncrement = this.visionAngle / (this.visionLineCount - 1);
    for (let i = 0; i < this.visionLineCount; i++) {
      const angleRad = Phaser.Math.DegToRad(
        this.currentAngle - halfAngle + i * angleIncrement
      );
      const endX = this.x + this.visionRadius * Math.cos(angleRad);
      const endY = this.y + this.visionRadius * Math.sin(angleRad);
      const direction = `angle_${i * angleIncrement}`;
      const isOverlapping = this.checkOverlap(
        this.x,
        this.y,
        endX,
        endY,
        points
      );
      this.visionLinesState[direction] = isOverlapping;
    }
  }

  private updateDebugVision(): void {
    if (this.debugVisionEnabled) {
      this.debugGraphics?.clear();
      const points = (this.scene as any).points.getChildren();
      const lineColor = 0x0000ff;
      const overlapColor = 0xff0000;

      const halfAngle = this.visionAngle / 2;
      const angleIncrement = this.visionAngle / (this.visionLineCount - 1);
      for (let i = 0; i < this.visionLineCount; i++) {
        const angleRad = Phaser.Math.DegToRad(
          this.currentAngle - halfAngle + i * angleIncrement
        );
        const endX = this.x + this.visionRadius * Math.cos(angleRad);
        const endY = this.y + this.visionRadius * Math.sin(angleRad);
        const isOverlapping =
          this.visionLinesState[`angle_${i * angleIncrement}`];
        this.debugGraphics?.lineStyle(
          2,
          isOverlapping ? overlapColor : lineColor,
          0.5
        );
        this.debugGraphics?.lineBetween(this.x, this.y, endX, endY);
      }
    }
  }

  private checkOverlap(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    points: Phaser.GameObjects.GameObject[]
  ): boolean {
    return points.some((point: Phaser.GameObjects.GameObject) => {
      const line = new Phaser.Geom.Line(x1, y1, x2, y2);
      // @ts-expect-error getBounds() is a function but the type is not correct
      const pointBounds = point.getBounds();
      return Phaser.Geom.Intersects.LineToRectangle(line, pointBounds);
    });
  }

  public takeAction(angle: number, travelForward: boolean): void {
    this.currentAngle = angle;
    if (travelForward) {
      this.x += this.visionRadius * Math.cos(Phaser.Math.DegToRad(angle));
      this.y += this.visionRadius * Math.sin(Phaser.Math.DegToRad(angle));
    }
    this.currentAngle = Phaser.Math.Wrap(this.currentAngle, 0, 360);
    this.updateVisionLinesState();
  }

  private updateVisionLinesState(): void {
    this.updateVisionLogic(); // Recalculate vision lines based on new angle and position
  }

  public calculateReward(): number {
    if (this.meetsGoalCondition()) {
      return 10; // Reward for achieving goal
    } else if (this.hitsObstacle()) {
      return -10; // Penalty for hitting an obstacle
    }
    return -1; // Small penalty for each move to encourage efficiency
  }

  private meetsGoalCondition(): boolean {
    // Check if the agent meets the goal condition
    // Placeholder logic
    return false;
  }

  private hitsObstacle(): boolean {
    // Check if the agent hits an obstacle
    // Placeholder logic
    return false; // Implement based on your game's map
  }
}
