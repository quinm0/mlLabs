export class Agent extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugVisionEnabled: boolean = false;
  private debugDataEnabled: boolean = false; // Added flag for debug data overlay
  private debugConsoleEnabled: boolean = false; // Added flag for console debug output
  private debugConsoleInterval: number = 5; // Interval in seconds for console debug output
  private lastDebugConsoleTime: number = 0; // Last time debug was output to console

  public visionLinesState: { [direction: string]: boolean } = {};
  public sensorData: { distance: number; direction: number }[] = [];
  public visionLineCount: number = 20;
  private currentAngle: number = 0;
  private visionRadius: number = 75;
  private visionAngle: number = 90;
  private speed: number; // Configurable speed
  private debugText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    speed: number = 2,
    debug?: true | { vision?: boolean; data?: boolean; console?: boolean }
  ) {
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
    this.speed = speed;

    scene.physics.add.existing(this);
    scene.add.existing(this);

    const textStyle = { font: "12px Arial", fill: "#000000", align: "left" };
    this.debugText = this.scene.add.text(20, 30, "", textStyle);

    if (debug) {
      if (typeof debug === "object") {
        this.debugVisionEnabled = debug.vision ?? true;
        this.debugDataEnabled = debug.data ?? true;
        this.debugConsoleEnabled = debug.console ?? true;
      } else {
        this.debugVisionEnabled = true;
        this.debugDataEnabled = true;
        this.debugConsoleEnabled = true;
      }
    }

    this.updateDebugData();
  }

  update(...args: any[]): void {
    let xDirection = 0;
    let yDirection = 0;

    if (this.cursors.left.isDown) {
      xDirection -= 1;
    }
    if (this.cursors.right.isDown) {
      xDirection += 1;
    }
    if (this.cursors.up.isDown) {
      yDirection -= 1;
    }
    if (this.cursors.down.isDown) {
      yDirection += 1;
    }

    // Calculate the angle based on the direction vectors
    if (xDirection !== 0 || yDirection !== 0) {
      const angle = Math.atan2(yDirection, xDirection) * (180 / Math.PI);
      this.takeAction(angle, true);
    }

    this.updateVisionLogic();
    this.updateDebugVision();
    this.updateDebugData(); // Added call to update debug data overlay
    this.updateDebugConsole(); // Added call to update console debug output
  }

  toggleDebugVision(): void {
    this.debugVisionEnabled = !this.debugVisionEnabled;
    if (!this.debugVisionEnabled) {
      this.debugGraphics?.clear();
    }
  }

  toggleDebugConsole(): void {
    this.debugConsoleEnabled = !this.debugConsoleEnabled;
  }

  setDebugConsoleInterval(seconds: number): void {
    this.debugConsoleInterval = seconds;
  }

  private updateDebugConsole(): void {
    if (this.debugConsoleEnabled) {
      const currentTime = this.scene.game.getTime();
      if (
        currentTime - this.lastDebugConsoleTime >=
        this.debugConsoleInterval * 1000
      ) {
        console.log(`Debug Info - Time: ${currentTime / 1000}s`);
        console.log(`Position - X: ${this.x}, Y: ${this.y}`);
        console.log(`Speed: ${this.speed}, Angle: ${this.currentAngle}`);
        console.log(`Sensor Data:`, this.sensorData);
        this.lastDebugConsoleTime = currentTime;
      }
    }
  }

  setVisionAngle(degrees: number): void {
    this.visionAngle = degrees;
  }

  private updateVisionLogic(): void {
    const points = (this.scene as any).points.getChildren();
    const halfAngle = this.visionAngle / 2;
    const angleIncrement = this.visionAngle / (this.visionLineCount - 1);
    this.sensorData = []; // Clear previous sensor data
    for (let i = 0; i < this.visionLineCount; i++) {
      const angleRad = Phaser.Math.DegToRad(
        this.currentAngle - halfAngle + i * angleIncrement
      );
      const startX = this.x + (this.width / 2) * Math.cos(angleRad);
      const startY = this.y + (this.height / 2) * Math.sin(angleRad);
      const endX = startX + this.visionRadius * Math.cos(angleRad);
      const endY = startY + this.visionRadius * Math.sin(angleRad);
      const direction = `angle_${i * angleIncrement}`;
      const closestDistance = this.calculateClosestOverlap(
        startX,
        startY,
        endX,
        endY,
        points
      );
      this.visionLinesState[direction] = closestDistance < this.visionRadius;
      this.sensorData.push({
        distance: closestDistance,
        direction: Phaser.Math.RadToDeg(angleRad),
      });
    }
  }

  private calculateClosestOverlap(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    points: Phaser.GameObjects.GameObject[]
  ): number {
    let closestDistance = this.visionRadius;
    points.forEach((point: Phaser.GameObjects.GameObject) => {
      const sprite = point as Phaser.GameObjects.Sprite; // Cast to Sprite
      const line = new Phaser.Geom.Line(x1, y1, x2, y2);
      const pointBounds = sprite.getBounds();
      if (Phaser.Geom.Intersects.LineToRectangle(line, pointBounds)) {
        const distance =
          Phaser.Math.Distance.Between(x1, y1, sprite.x, sprite.y) -
          sprite.width / 2;
        if (distance < closestDistance) {
          closestDistance = distance;
        }
      }
    });
    return closestDistance;
  }

  private updateDebugVision(): void {
    if (this.debugVisionEnabled) {
      this.debugGraphics?.clear();
      const lineColor = 0x0000ff;
      const overlapColor = 0xff0000;

      const halfAngle = this.visionAngle / 2;
      const angleIncrement = this.visionAngle / (this.visionLineCount - 1);
      for (let i = 0; i < this.visionLineCount; i++) {
        const angleRad = Phaser.Math.DegToRad(
          this.currentAngle - halfAngle + i * angleIncrement
        );
        const startX = this.x + (this.width / 2) * Math.cos(angleRad);
        const startY = this.y + (this.height / 2) * Math.sin(angleRad);
        const endX = startX + this.visionRadius * Math.cos(angleRad);
        const endY = startY + this.visionRadius * Math.sin(angleRad);
        const isOverlapping =
          this.visionLinesState[`angle_${i * angleIncrement}`];
        this.debugGraphics?.lineStyle(
          2,
          isOverlapping ? overlapColor : lineColor,
          0.5
        );
        this.debugGraphics?.lineBetween(startX, startY, endX, endY);
      }
    }
  }
  private updateDebugData(): void {
    // Added method to handle debug data overlay
    if (this.debugDataEnabled) {
      const rectHeight = 100 + this.sensorData.length * 20; // Calculate height based on number of sensors
      this.debugGraphics?.fillStyle(0xffffff, 0.5);
      this.debugGraphics?.fillRect(10, 10, 200, rectHeight);
      this.debugGraphics?.lineStyle(1, 0x000000, 1);
      this.debugGraphics?.strokeRect(10, 10, 200, rectHeight);

      // Update the text content
      this.debugText?.setText([
        `Speed: ${this.speed}`,
        `Angle: ${this.currentAngle.toFixed(2)}`,
        `X: ${this.x.toFixed(2)}`,
        `Y: ${this.y.toFixed(2)}`,
        ...this.sensorData.map(
          (data) =>
            `Distance: ${data.distance.toFixed(
              2
            )}, Direction: ${data.direction.toFixed(2)}`
        ),
      ]);
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
      this.x += this.speed * Math.cos(Phaser.Math.DegToRad(angle));
      this.y += this.speed * Math.sin(Phaser.Math.DegToRad(angle));
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
