import { ObjectId } from "mongodb";

export interface Room {
  name: string;
  userIds: ObjectId[];
}
