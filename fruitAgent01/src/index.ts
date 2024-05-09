import { fabric } from 'fabric';

document.addEventListener('DOMContentLoaded', function () {
  // wrap the canvas in a boarder to see the canvas
  const canvasElement = document.getElementById('c');
  if (!canvasElement) {
    throw new Error('Canvas element not found');
  }
  canvasElement.style.border = '1px solid black';

  const canvas = new fabric.Canvas('c');
  const circle = new fabric.Circle({
    radius: 100,
    fill: '#ff5724',
    left: 100,
    top: 100,
  });

  canvas.add(circle);
});

// Connect to websocket server
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('message', (event) => {
  // Listen for server.publish('server-event', 'recompile');
  const message = event.data;
  console.log('Received message:', message);
  if (message === 'recompile') {
    console.log('Reloading browser...');
    window.location.reload();
  }
});
