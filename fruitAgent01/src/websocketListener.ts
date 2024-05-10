export default function listenForRefresh() {
  // Connect to websocket server
  const ws = new WebSocket('ws://localhost:8080');

  ws.addEventListener('message', (event) => {
    const message = event.data;
    console.log('Received message:', message);
    if (message === 'recompile') {
      console.log('Reloading browser...');
      window.location.reload();
    }
  });
}
