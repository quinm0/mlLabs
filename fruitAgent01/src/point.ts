export class Point extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const textureKey = "point";
    const size = 25;
    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0x0000ff, 1); // blue color, fully opaque
      graphics.fillCircle(size, size, size); // Draw a circle with radius 25
      graphics.generateTexture(textureKey, size * 2, size * 2);
      graphics.destroy();
    }

    super(scene, x, y, textureKey);

    scene.physics.add.existing(this);
    scene.add.existing(this);
  }

  update(...args: any[]): void {}
}
