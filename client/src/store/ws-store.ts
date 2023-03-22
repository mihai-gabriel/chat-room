import {
  ChatMessage,
  ErrorResponsePayload,
  RequestPayload,
  ResponsePayload,
  WsMessage,
  WsMessageType,
} from "../types";

type Listener = () => void;

// store data
let socket: WebSocket;
let messages: ChatMessage[] = [];
let listeners: Listener[] = [];

// user auth data
const websocket_url = import.meta.env.VITE_WS_URL_CHAT;

const getUserId = () => {
  return localStorage.getItem("userId");
};

const getRoomId = () => {
  return localStorage.getItem("roomId");
};

export const messageStore = {
  initMessages(data: ChatMessage[]) {
    messages = data;
    emitChange();
  },
  updateMessages(data: ChatMessage) {
    messages = [...messages, data];
    emitChange();
  },
  sendMessage(message: string) {
    const userId = getUserId();
    const roomId = getRoomId();

    if (!userId || !roomId) return;

    const sentMessageData: WsMessage<RequestPayload> = {
      type: WsMessageType.CHAT_MESSAGE,
      payload: { userId, roomId, message },
    };

    socket.send(JSON.stringify(sentMessageData));
  },
  subscribe(listener: Listener) {
    // socket
    socket = new WebSocket(websocket_url);

    socket.addEventListener("open", (_event) => {
      const userId = getUserId();
      const roomId = getRoomId();

      if (!userId || !roomId) return;

      const initialClientMessage: WsMessage<RequestPayload> = {
        type: WsMessageType.CHAT_HISTORY,
        payload: { userId, roomId },
      };

      // send auth for initial connection
      socket.send(JSON.stringify(initialClientMessage));
    });

    // Note: MessageEvent<string> is how we receive the stringified data.
    //       It is NOT our own ChatMessage type!
    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const serverResponse: WsMessage<ResponsePayload> = JSON.parse(event.data);

      switch (serverResponse.type) {
        case WsMessageType.SERVER_ERROR:
          const error = serverResponse.payload as ErrorResponsePayload;
          console.error(`[Server WS]: ${error.message}`);
          break;

        case WsMessageType.CHAT_HISTORY:
          messageStore.initMessages(serverResponse.payload as ChatMessage[]);
          break;

        case WsMessageType.CHAT_MESSAGE:
          messageStore.updateMessages(serverResponse.payload as ChatMessage);
          break;
      }
    });

    // before leaving the window, notify server
    // what user has disconnected by sending their id
    window.addEventListener("beforeunload", (e) => {
      socket.close(3001, `${getUserId()}`);
    });

    listeners = [...listeners, listener];

    return () => {
      // if there's no outgoing data pending, close the connection.
      if (socket.bufferedAmount === 0) {
        socket.close(3001, `${getUserId()}`);
      }

      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return messages;
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}
