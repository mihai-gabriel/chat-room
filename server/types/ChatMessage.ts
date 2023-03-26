import { ObjectId, WithId } from "mongodb";
import { User } from "./User";

export interface ChatMessage {
  authorId: ObjectId;
  roomId: ObjectId;
  edited: boolean;
  text: string;
}

export interface ChatMessageDto {
  _id: ObjectId;
  roomId: ObjectId;
  author: WithId<User>;
  text: string;
  creationDate: string;
  edited: boolean;
}
