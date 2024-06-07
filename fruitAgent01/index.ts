import { watch } from "fs";

// Set log levels to diplay
const ALL_LOG_LEVELS = ["debug", "info", "warn", "error"]; // <-- don't change this
const ENABLED_LOG_LEVELS = ["info", "warn", "error"]; // <-- Change this to enable/disable log levels
ALL_LOG_LEVELS.filter(
  (logLevel) => !ENABLED_LOG_LEVELS.includes(logLevel)
).forEach((logLevel) => {
  // @ts-expect-error
  console[logLevel] = () => {};
});

// build all files in the directory except index.ts
console.debug("Building app");
// get list of files in the directory except index.ts
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./public",
});
console.debug("App built");

console.log("Starting server...");
const server = Bun.serve({
  fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve static files from the public directory
    const file = path === "/" ? "/index.html" : path;
    return new Response(Bun.file(`./public${file}`));
  },
  port: 3000,
});
console.log(`Serving on http://${server.hostname}:${server.port}`);

// start websocket server
console.debug("Starting websocket server...");
const websocketServer = Bun.serve({
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    message() {},
    open(ws) {
      ws.subscribe("server-event");
    },
    close(ws) {
      ws.unsubscribe("server-event");
    },
  }, // handlers
  port: 8080,
});
console.debug(
  `Websocket server started on ws://${websocketServer.hostname}:${websocketServer.port}`
);

const watcher = watch(
  `${import.meta.dir}/src`,
  { recursive: true },
  async (event, filename) => {
    console.debug(`Building...`);
    await Bun.build({
      entrypoints: ["./src/index.ts"],
      outdir: "./public",
    });
    console.debug(`Built`);

    // notify the browser to reload
    console.debug("Reloading browser...");
    websocketServer.publish("server-event", "recompile");
  }
);

process.on("SIGINT", () => {
  console.debug("Closing file watcher...");
  watcher.close();

  console.debug("Closing server...");
  server.stop();

  console.debug("Closing websocket server...");
  websocketServer.stop();

  process.exit(0);
});
