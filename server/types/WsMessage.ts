export enum WsMessageType {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  CHAT_HISTORY = "CHAT_HISTORY",
  SERVER_ANNOUNCEMENT = "SERVER_ANNOUNCEMENT",
  SERVER_ERROR = "SERVER_ERROR",
}

export interface WsMessage<T extends object> {
  type: WsMessageType;
  payload: T;
}

export interface Payload {
  userId: string;
  roomId: string;
  message?: string;
}

export interface ErrorPayload {
  code: number;
  message: string;
}
