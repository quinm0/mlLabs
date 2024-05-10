import { fabric } from 'fabric';
import listenForRefresh from './websocketListener';
import { Agent } from './agent';

listenForRefresh();

document.addEventListener('DOMContentLoaded', function () {
  // wrap the canvas in a boarder to see the canvas
  const canvasElement = document.getElementById('c');
  if (!canvasElement) {
    throw new Error('Canvas element not found');
  }
  canvasElement.style.border = '1px solid black';
  const canvas = new fabric.StaticCanvas('c');

  const agent = new Agent();
  canvas.add(agent);

  console.log('sussy baka');

  // every 100ms call agent.goForward
  // setInterval(() => {
  //   agent.goForward();
  //   canvas.renderAll();
  // }, 100);

  //call canvas.renderAll() to render the canvas 60 times a second
  setInterval(() => {
    agent.tick();
    canvas.renderAll();
  }, 1000);
});
