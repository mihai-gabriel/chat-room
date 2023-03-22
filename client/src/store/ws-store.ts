import {
  ChatMessage,
  FullChatMessage,
  Payload,
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

export const messageStore = {
  initMessages(data: ChatMessage[]) {
    messages = data;
    emitChange();
  },
  updateMessages(data: ChatMessage) {
    messages = [...messages, data];
    emitChange();
  },
  sendMessage(message: Partial<ChatMessage>) {
    // const sentMessageData: WsMessage<ChatMessage> = {
    //   userId: getUserId(),
    //   data: message,
    // };
    //
    // console.log("sentMessage:", sentMessageData);
    //
    // socket.send(JSON.stringify(sentMessageData));
  },
  subscribe(listener: Listener) {
    // socket
    socket = new WebSocket(websocket_url);

    socket.addEventListener("open", (_event) => {
      const userId = getUserId();

      if (!userId) return;

      const initialClientMessage: WsMessage<Payload> = {
        type: WsMessageType.CHAT_HISTORY,
        payload: {
          userId: "6416fd5a34e70e6ec09b5a1b",
          roomId: "641b07491c4d353d758e3db2",
        },
      };

      // send auth for initial connection
      socket.send(JSON.stringify(initialClientMessage));
    });

    // Note: MessageEvent<string> is how we receive the stringified data.
    //       It is NOT our own ChatMessage type!
    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const receivedMessageFromServer: WsMessage<ChatMessage[]> = JSON.parse(
        event.data
      );

      // retrieve message history for this user
      if (receivedMessageFromServer.type === WsMessageType.CHAT_HISTORY) {
        messageStore.initMessages(receivedMessageFromServer.payload);
      }
    });

    // socket.addEventListener("message", (event: MessageEvent<string>) => {
    //   const receivedMessageFromServer: WsServerMessage<FullChatMessage> =
    //     JSON.parse(event.data);
    //
    //   if (receivedMessageFromServer.type === WsMessageType.CHAT_MESSAGE) {
    //     messageStore.updateMessages(receivedMessageFromServer.data);
    //   }
    // });

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
