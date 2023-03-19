// User DB interface
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
