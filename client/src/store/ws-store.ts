import { ChatMessage, MessageType, WsMessage } from "../types";

type Listener = () => void;

// the actual store
let messages: ChatMessage[] = [];
let listeners: Listener[] = [];

// user auth data
const userId = localStorage.getItem("userId") || "";

// socket
const socket = new WebSocket("ws://localhost:5000");

socket.addEventListener("open", (_event) => {
  const initialClientMessage: WsMessage<string> = {
    type: MessageType.INITIAL,
    data: userId,
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
  if (receivedMessageFromServer.type === MessageType.INITIAL) {
    messageStore.initMessages(receivedMessageFromServer.data);
  }
});

socket.addEventListener("message", (event: MessageEvent<string>) => {
  const receivedMessageFromServer: WsMessage<ChatMessage> = JSON.parse(
    event.data
  );

  if (receivedMessageFromServer.type === MessageType.CHAT_MESSAGE) {
    messageStore.updateMessages(receivedMessageFromServer.data);
  }
});

export const messageStore = {
  initMessages(data: ChatMessage[]) {
    messages = data;
    emitChange();
  },
  updateMessages(data: ChatMessage) {
    messages = [...messages, data];
    emitChange();
  },
  sendMessage(message: ChatMessage) {
    const sentMessageData: WsMessage<ChatMessage> = {
      type: MessageType.CHAT_MESSAGE,
      data: message,
    };

    socket.send(JSON.stringify(sentMessageData));
  },
  subscribe(listener: Listener) {
    listeners = [...listeners, listener];

    return () => {
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
