export class Agent extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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
  }
}
