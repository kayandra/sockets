import { createSocketsClient } from "./sockets";

type Config = { client: PingClient; config: PingConfig };
type Latency = {
  roundTripMs: number;
  startMs: number;
  endMs: number;
  pingMs: number;
};

export type PingConfig = {
  url: string;
  protocols?: string[];
  autoload?: boolean;
  reconnectOnError?: boolean;
  pingMessage?(c: Config): string;
  onClose?(c: Config): void;
  onPing?(c: Latency, cl: Config): void;
};

export function createPingClient(config: PingConfig) {
  const {
    url,
    protocols = [],
    autoload = true,
    pingMessage = () => "PING",
    reconnectOnError = true,
    onClose,
    onPing,
  } = config;

  let startMs = 0;
  const client = { ping, close };
  const callbackConfig = { client, config };
  const sockets = createSocketsClient({
    url,
    autoload,
    protocols,
    reconnectOnError,
    onOpen: () => ping(),
    onMessage() {
      if (!startMs) return;

      const endMs = performance.now();
      const roundTripMs = endMs - startMs;
      const pingMs = roundTripMs / 2;
      const latency = { startMs, endMs, roundTripMs, pingMs };
      onPing?.(latency, callbackConfig);
      startMs = 0;
    },
  });

  function ping() {
    if (startMs) return;
    startMs = performance.now();
    sockets.sendRaw(pingMessage(callbackConfig));
  }

  function close() {
    sockets.close();
    startMs = 0;
    onClose?.(callbackConfig);
  }

  return client;
}

export type PingClient = ReturnType<typeof createPingClient>;
