export class Agent extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugVisionEnabled: boolean = true;
  private visionLinesState: { [direction: string]: boolean } = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

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
    if (this.cursors.left.isDown) {
      this.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(160);
    } else {
      this.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(160);
    } else {
      this.setVelocityY(0);
    }

    this.updateDebugVision();
  }

  toggleDebugVision(): void {
    this.debugVisionEnabled = !this.debugVisionEnabled;
    if (!this.debugVisionEnabled) {
      this.debugGraphics?.clear();
    }
  }

  private updateDebugVision(): void {
    if (this.debugVisionEnabled) {
      this.debugGraphics?.clear();
      const points = (this.scene as any).points.getChildren();
      const lineColor = 0x0000ff; // default blue color
      const overlapColor = 0xff0000; // red color for overlap

      // Function to check overlap with points
      const checkOverlap = (
        x1: number,
        y1: number,
        x2: number,
        y2: number
      ): boolean => {
        const lineRect = new Phaser.Geom.Rectangle(
          Math.min(x1, x2),
          Math.min(y1, y2),
          Math.abs(x2 - x1),
          Math.abs(y2 - y1)
        );

        return points.some((point: Phaser.GameObjects.GameObject) => {
          // @ts-expect-error getBounds() is a function but the type is not correct
          return Phaser.Geom.Rectangle.Overlaps(lineRect, point.getBounds());
        });
      };

      // Draw lines in four directions with color change on overlap
      const drawLine = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        direction: string
      ) => {
        const isOverlapping = checkOverlap(x1, y1, x2, y2);
        this.visionLinesState[direction] = isOverlapping;
        this.debugGraphics?.lineStyle(
          2,
          isOverlapping ? overlapColor : lineColor,
          0.5
        );
        this.debugGraphics?.lineBetween(x1, y1, x2, y2);
      };

      drawLine(this.x, this.y, this.x + 100, this.y, "right"); // Right
      drawLine(this.x, this.y, this.x - 100, this.y, "left"); // Left
      drawLine(this.x, this.y, this.x, this.y + 100, "down"); // Down
      drawLine(this.x, this.y, this.x, this.y - 100, "up"); // Up
    }
  }
}
