export enum MessageType {
  INITIAL = "INITIAL",
  CHAT_MESSAGE = "CHAT_MESSAGE",
}

export interface WsMessage<T> {
  type: MessageType; // refactor to ENUM
  data: T;
}
