import { ChatMessage, ChatMessageDto } from "./ChatMessage";

export enum WsMessageType {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  CHAT_MESSAGE_UPDATE = "CHAT_MESSAGE_UPDATE",
  CHAT_MESSAGE_DELETE = "CHAT_MESSAGE_DELETE",
  CHAT_HISTORY = "CHAT_HISTORY",

  SERVER_ANNOUNCEMENT = "SERVER_ANNOUNCEMENT",
  SERVER_ERROR = "SERVER_ERROR",
  REQUEST_VALIDATED = "REQUEST_VALIDATED",
}

export interface WsMessage<T extends object> {
  type: WsMessageType;
  payload: T;
}

export interface RequestPayload {
  userId: string;
  roomId: string;
  message?: ChatMessageDto;
}

export interface ErrorResponsePayload {
  code: number;
  message: string;
}

export interface DeleteResponsePayload {
  _id: string;
}

export type ResponsePayload =
  | DeleteResponsePayload
  | ErrorResponsePayload
  | ChatMessage[]
  | ChatMessage;
