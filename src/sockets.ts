type Config<T> = { event: T; config: SocketsConfig };

export type SocketsClient = ReturnType<typeof createSocketsClient>;
export interface SocketsConfig {
  url: string;
  autoload?: boolean;
  protocols?: string[];
  reconnectOnError?: boolean;
  maxAttempts?: number;
  onOpen?(ws: SocketsClient, c: Config<WebSocketEventMap["open"]>): void;
  onMessage?(ws: SocketsClient, c: Config<WebSocketEventMap["message"]>): void;
  onError?(ws: SocketsClient, c: Config<WebSocketEventMap["error"]>): void;
  onClose?(ws: SocketsClient, c: Config<WebSocketEventMap["close"]>): void;
  onReconnect?(ws: SocketsClient, c: { config: SocketsConfig }): void;
  onMaxAttempts?(
    ws: SocketsClient,
    c: { attempts: number; config: SocketsConfig }
  ): void;
}

export function createSocketsClient(config: SocketsConfig) {
  let ws: WebSocket;
  let retryAttempts = 0;

  const {
    url,
    autoload = true,
    maxAttempts = Infinity,
    protocols = [],
    reconnectOnError = true,
    onOpen,
    onMessage,
    onError,
    onClose,
    onReconnect,
    onMaxAttempts,
  } = config;
  const sockets = { open, reconnect, send, sendRaw, close };

  if (autoload) {
    open();
  }

  function open() {
    ws = new WebSocket(url, protocols);
    ws.onopen = (event) => onOpen?.(sockets, { event, config });
    ws.onmessage = (event) => onMessage?.(sockets, { event, config });
    ws.onclose = (event) => onClose?.(sockets, { event, config });
    ws.onerror = (event) => {
      if (reconnectOnError) {
        reconnect();
      }

      onError?.(sockets, { event, config });
    };
  }

  function reconnect() {
    if (retryAttempts === maxAttempts) {
      onMaxAttempts?.(sockets, { attempts: retryAttempts, config });
      retryAttempts = 0;
    } else {
      open();
      onReconnect?.(sockets, { config });
      retryAttempts++;
    }
  }

  function close(code = 1e3, reason?: string) {
    if (code < 1e3 || code > 1015) {
      throw new RangeError("INVALID_CLOSE");
    }

    ws.close(code, reason);
    retryAttempts = 0;
  }

  function send<T extends Record<string, unknown>>(obj: T) {
    sendRaw(JSON.stringify(obj));
  }

  function sendRaw(raw: Parameters<WebSocket["send"]>[0]) {
    ws.send(raw);
  }

  return sockets;
}
