// User DB interface
import { ObjectId } from "mongodb";

export interface UserDB {
  id?: number;
  username?: string;
  password: string;
}

// UserDTO: data that is sent back to the client
export interface Profile {
  id: number;
  username: string;
}

export interface User {
  username: string;
  fullName: string;
  email: string;
}
