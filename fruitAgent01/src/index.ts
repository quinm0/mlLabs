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

  agent.animateSetAngle(0);
  agent.goForward();
  agent.animateSetAngle(90);
  agent.goForward();
  agent.animateSetAngle(180);
  agent.goForward();
  console.log('done');
});
