export enum WsMessageType {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  CHAT_HISTORY = "CHAT_HISTORY",
  SERVER_ANNOUNCEMENT = "SERVER_ANNOUNCEMENT",
}

export interface WsServerMessage<T> {
  type: WsMessageType;
  data: T;
}

export interface WsClientMessage<T> {
  userId: number; // TODO: Refactor to userToken
  data: T;
}
