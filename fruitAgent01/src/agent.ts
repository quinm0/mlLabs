export class Agent extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugVisionEnabled: boolean = true;
  public visionLinesState: { [direction: string]: boolean } = {
    // Changed to public for external access
  };
  private currentAngle: number = 0; // Added to track the current angle of the agent
  private visionLineCount: number = 5; // Number of vision lines
  private visionRadius: number = 100; // Radius for vision lines
  private visionAngle: number = 90; // Degrees of vision

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const textureKey = "playerCircle";
    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xff0000, 1); // Red color, fully opaque
      graphics.fillCircle(25, 25, 25); // Draw a circle with radius 25
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
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown) {
      dx -= 160;
    }
    if (this.cursors.right.isDown) {
      dx += 160;
    }
    this.setVelocityX(dx);

    if (this.cursors.up.isDown) {
      dy -= 160;
    }
    if (this.cursors.down.isDown) {
      dy += 160;
    }
    this.setVelocityY(dy);

    // Update the current angle based on the direction of movement
    if (dx !== 0 || dy !== 0) {
      this.currentAngle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
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
      const lineColor = 0x0000ff; // default blue color
      const overlapColor = 0xff0000; // red color for overlap

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
      const pointCenter = new Phaser.Geom.Point(
        pointBounds.centerX,
        pointBounds.centerY
      );
      return Phaser.Geom.Intersects.LineToRectangle(line, pointBounds);
    });
  }
}
