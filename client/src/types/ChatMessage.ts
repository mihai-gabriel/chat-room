import { User } from "./User";

export interface ChatMessage {
  _id: string;
  author: User;
  roomId: string;
  text: string;
  creationDate: string;
}
