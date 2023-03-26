import { User } from "./User";

export interface ChatMessage {
  _id: string;
  author: User;
  roomId: string;
  text: string;
  creationDate: string;
  edited: boolean;
}

export interface ChatMessageDto {
  authorId: string;
  roomId: string;
  text: string;
}

export type WithId<T> = T & {
  _id: string;
};
