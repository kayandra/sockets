import getPort from "get-port";
import { WebSocketServer } from "ws";
import { type SocketsConfig, createSocketsClient } from "../src/sockets";

export async function createWebsocketServer() {
  const wss = new WebSocketServer({ port: await getPort({ port: 69e2 }) });
  const url = `ws://localhost:${wss.options.port}`;

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      switch (data.toString()) {
        case "CLOSE":
          return ws.close();
        default:
          ws.send(data);
      }
    });
  });

  return { wss, url };
}

export async function createTestSocketsClient(
  handler: (res: () => void, rej: () => void) => Partial<SocketsConfig>
) {
  return new Promise((resolve, reject) => {
    createSocketsClient({
      url: (global as any).__sockets.url,
      ...handler(
        () => resolve(0),
        () => reject(1)
      ),
    });
  });
}
