import getPort from "get-port";
import { describe, it } from "vitest";
import { createTestSocketsClient } from "../tests/utils";

const url = `wss://127.0.0.1:${await getPort()}`;

describe("Sockets", async () => {
  describe("on::open", () => {
    it("opens a connection", async () => {
      await createTestSocketsClient((onOpen) => ({ onOpen }));
    });
  });

  describe("on::message", () => {
    it("listens to messages", async () => {
      await createTestSocketsClient((onMessage) => ({
        onMessage,
        onOpen(ws) {
          ws.sendRaw("PING");
        },
      }));
    });
  });

  describe("on::close", () => {
    it("client side", async () => {
      await createTestSocketsClient((onClose) => ({
        onClose,
        onOpen(ws) {
          ws.close();
        },
      }));
    });

    it("server side", async () => {
      await createTestSocketsClient((onClose) => ({
        onClose,
        onOpen(ws) {
          ws.sendRaw("CLOSE");
        },
      }));
    });
  });

  describe("on::error", () => {
    it("handles errors", async () => {
      await createTestSocketsClient((onError) => ({ url, onError }));
    });
  });

  describe("on::reconnect", () => {
    it("reconnects on error", async () => {
      await createTestSocketsClient((onReconnect) => ({
        url,
        onReconnect,
        maxAttempts: 1,
      }));
    });

    it("stops reconnecting after maxAttempts", async () => {
      await createTestSocketsClient((resolve, reject) => ({
        url,
        maxAttempts: 5,
        onMaxAttempts(ws, { attempts, config }) {
          attempts === config.maxAttempts ? resolve() : reject();
        },
      }));
    });

    it("can re-open after a manual close", async () => {
      let loopCounter = 0;
      await createTestSocketsClient((resolve) => ({
        onOpen(ws) {
          ws.close();
          loopCounter++;
        },
        onClose(ws) {
          loopCounter > 2 ? resolve() : ws.open();
        },
      }));
    });

    it("can reconnect after manual close", async () => {
      let loopCounter = 0;
      await createTestSocketsClient((resolve) => ({
        onOpen(ws) {
          ws.close();
          loopCounter++;
        },
        onClose(ws) {
          loopCounter > 2 ? resolve() : ws.reconnect();
        },
      }));
    });

    it("respects reconnect max attempts after manual close", async () => {
      let loopCounter = 0;
      await createTestSocketsClient((resolve, onMaxAttempts) => ({
        maxAttempts: 3,
        onMaxAttempts,
        onOpen(ws) {
          ws.close();
          loopCounter++;
        },
        onClose(ws) {
          loopCounter >= 6 ? resolve() : ws.reconnect();
        },
      }));
    });

    it.skip("should not attempt after manual close", async () => {
      await createTestSocketsClient((onClose, onReconnect) => ({
        onClose,
        onReconnect,
        onOpen(ws) {
          ws.close();
        },
      }));
    });
  });
});
