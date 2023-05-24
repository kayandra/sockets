import getPort from "get-port";
import { uid } from "uid/single";
import { WebSocketServer } from "ws";
import { type SocketsConfig, createSocketsClient } from "../src/sockets";
import { type PingConfig, createPingClient } from "../src/ping";

export async function createWebsocketServer() {
  const wss = new WebSocketServer({ port: await getPort() });
  const url = `ws://localhost:${wss.options.port}`;

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      const { type, id } = JSON.parse(data.toString());
      switch (type) {
        case "CLOSE":
          return ws.close();
        case "PING":
          return ws.send(id);
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

export async function createTestPingClient(
  handler: (res: () => void, rej: () => void) => Partial<PingConfig>
) {
  return new Promise((resolve, reject) => {
    createPingClient({
      url: (global as any).__sockets.url,
      pingMessage: () => JSON.stringify({ type: "PING", id: uid() }),
      ...handler(
        () => resolve(0),
        () => reject(1)
      ),
    });
  });
}
