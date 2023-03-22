// User DB interface
export interface UserDB {
  id?: number;
  username?: string;
  password: string;
}

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
}
