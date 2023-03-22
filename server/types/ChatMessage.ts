import { ObjectId, WithId } from "mongodb";
import { User } from "./UserDB";

export interface ChatMessage {
  authorId: ObjectId;
  roomId: ObjectId;
  text: string;
}

export interface ChatMessageDto {
  _id: ObjectId;
  roomId: ObjectId;
  author: User;
  timestamp: string;
}
