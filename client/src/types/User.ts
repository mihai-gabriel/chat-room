export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
}

export interface UserDb {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

export interface UserSession {
  user: User;
  roomId: string;
}
