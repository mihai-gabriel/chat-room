import {
  ChatMessage,
  ChatMessageDto,
  DeleteResponsePayload,
  ErrorResponsePayload,
  RequestPayload,
  ResponsePayload,
  WithId,
  WsMessage,
  WsMessageType,
} from "../types";

import { localStorageStore } from "./localStorageStore";

type Listener = () => void;

// store data
let socket: WebSocket;
let messages: ChatMessage[] = [];
let listeners: Listener[] = [];

// user auth data
const websocket_url = import.meta.env.VITE_WS_URL_CHAT;

const emitChange = () => listeners.forEach((ln) => ln());

const handleSocketOpen = (_event: Event) => {
  const { user, roomId } = localStorageStore.getSnapshot();

  if (!user || !roomId) return;

  const initialClientMessage: WsMessage<RequestPayload> = {
    type: WsMessageType.CHAT_HISTORY,
    payload: { userId: user._id, roomId },
  };

  // send auth for initial connection
  socket.send(JSON.stringify(initialClientMessage));
};

const handleSocketMessage = (event: MessageEvent<string>) => {
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

    case WsMessageType.CHAT_MESSAGE_UPDATE:
      messageStore.updateMessage(serverResponse.payload as ChatMessage);
      break;

    case WsMessageType.CHAT_MESSAGE_DELETE:
      const deletePayload = serverResponse.payload as DeleteResponsePayload;
      messageStore.deleteMessage(deletePayload._id);
      break;
  }
};

const handleSocketClose = () => {
  emitChange();
};

const handleWindowUnload = (e: Event) => {
  const { user } = localStorageStore.getSnapshot();

  // before leaving the window, notify server
  // what user has disconnected by sending their id
  socket.close(3001, `${user?._id}`);
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
  updateMessage(message: ChatMessage) {
    messages = messages.map((msg) => (msg._id === message._id ? message : msg));
    emitChange();
  },
  deleteMessage(_id: string) {
    messages = messages.filter((message_) => message_._id !== _id);
    emitChange();
  },
  sendDeleteMessage(message: ChatMessage) {
    const { user, roomId } = localStorageStore.getSnapshot();

    if (!user || !roomId) return;

    const deletedMessage: WithId<ChatMessageDto> = {
      _id: message._id,
      authorId: message._id,
      roomId,
      text: "",
    };

    const deleteMessageData: WsMessage<RequestPayload> = {
      type: WsMessageType.CHAT_MESSAGE_DELETE,
      payload: { userId: user._id, roomId, message: deletedMessage },
    };

    socket.send(JSON.stringify(deleteMessageData));
  },
  sendMessage(text: string) {
    const { user, roomId } = localStorageStore.getSnapshot();

    if (!user || !roomId) return;

    const message: ChatMessageDto = { authorId: user._id, roomId, text };

    const sentMessageData: WsMessage<RequestPayload> = {
      type: WsMessageType.CHAT_MESSAGE,
      payload: { userId: user._id, roomId, message },
    };

    socket.send(JSON.stringify(sentMessageData));
  },
  sendMessageUpdate(message: ChatMessage, updatedText: string) {
    const { user, roomId } = localStorageStore.getSnapshot();

    if (!user || !roomId) return;

    const updatedMessage: WithId<ChatMessageDto> = {
      _id: message._id,
      authorId: message.author._id,
      roomId: message.roomId,
      text: updatedText,
    };

    const sentMessageData: WsMessage<RequestPayload> = {
      type: WsMessageType.CHAT_MESSAGE_UPDATE,
      payload: { userId: user._id, roomId, message: updatedMessage },
    };

    socket.send(JSON.stringify(sentMessageData));
  },
  subscribe(listener: Listener) {
    // socket
    socket = new WebSocket(websocket_url);

    socket.addEventListener("open", handleSocketOpen);
    socket.addEventListener("message", handleSocketMessage);
    socket.addEventListener("close", handleSocketClose);
    window.addEventListener("beforeunload", handleWindowUnload);

    listeners = [...listeners, listener];

    return () => {
      // if there's no outgoing data pending, close the connection.
      if (socket.bufferedAmount === 0) {
        const { user } = localStorageStore.getSnapshot();
        socket.close(3001, `${user?._id}`);
      }

      socket.removeEventListener("open", handleSocketOpen);
      socket.removeEventListener("message", handleSocketMessage);
      socket.removeEventListener("close", handleSocketClose);
      window.removeEventListener("beforeunload", handleWindowUnload);

      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return messages;
  },
};
