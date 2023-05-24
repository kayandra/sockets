import { afterAll, beforeAll } from "vitest";
import { WebSocketServer } from "ws";
import { createWebsocketServer } from "./utils";

const globalForSetup = globalThis as unknown as {
  __sockets: {
    url: string;
    wss: WebSocketServer;
  };
};

beforeAll(async () => {
  globalForSetup.__sockets = await createWebsocketServer();
});

afterAll(() => {
  globalForSetup.__sockets.wss.close();
});
