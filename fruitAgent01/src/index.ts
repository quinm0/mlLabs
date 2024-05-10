import Phaser from 'phaser';
import listenForRefresh from './websocketListener';

listenForRefresh();

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200, x: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('fruit', 'path/to/fruit.png');
}

function create() {
  this.fruit = this.physics.add.image(400, 300, 'fruit');
}

function update() {
  // Logic to move the fruit or respond to ML model's decisions
}
