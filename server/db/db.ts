import { ChatMessage, ChatMessageDB, Profile, UserDB } from "../types";

let idx = 4;

let historyFromDB: ChatMessageDB[] = [
  { id: 1, authorId: 5, text: "Hello" },
  { id: 2, authorId: 6, text: "Hello, there" },
  { id: 3, authorId: 5, text: "Thanks" },
];

// Note: Promises are not necessary here
//       But perhaps they'd matter when I'll have a real DB connection?
const getMessages = (): Promise<ChatMessageDB[]> => {
  return new Promise((resolve, reject) => {
    if (historyFromDB.length === 0) {
      reject("Simulate error if db connection was unsuccessful");
      return;
    }

    resolve(historyFromDB);
  });
};

const addMessage = (
  message: ChatMessage,
  authorId: number
): Promise<ChatMessageDB> => {
  return new Promise<ChatMessageDB>((resolve) => {
    // dumb auto id
    const messageDb: ChatMessageDB = { ...message, id: idx++, authorId };
    historyFromDB = [...historyFromDB, messageDb];

    resolve(messageDb);
  });
};

const messageService = { addMessage, getMessages };

let userIdx = 1;
let users: UserDB[] = [
  { id: 5, username: "test", password: "test" },
  { id: 6, username: "test2", password: "test2" },
];
let loggedInUsers: number[] = [];

const addUser = (user: UserDB): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    // dumb auto id
    user.id = userIdx++;

    // Note: I'll implement encryption when using a real database.
    // user.password = encryptPassword(user.password);

    users = [...users, user];

    resolve(true);
  });
};

const getUserProfileById = (userId: number): Profile | undefined => {
  const user = users.find((user) => user.id === userId);

  console.log("userId:", userId);

  if (user) {
    return { id: user?.id, username: user.username } as Profile;
  }

  return undefined;
};

const getUserByCredentials = (
  username: string,
  password: string
): UserDB | undefined => {
  return users.find(
    (user) => user.username === username && user.password === password
  );
};

const loginUserFromChat = (userId: number) => {
  // If user is not already "online", we mark them as being "online"
  const userAlreadyOnline = loggedInUsers.includes(userId);
  const userInDatabase = users.find((user) => user.id == userId);

  if (!userAlreadyOnline && userInDatabase) {
    loggedInUsers = [...loggedInUsers, userId];
  }
};

const logoutUserFromChat = (userId: UserDB["id"]) => {
  loggedInUsers = loggedInUsers.filter((id) => id !== userId);
  console.log("now, loggedInUsers:", loggedInUsers);
};

const getLoggedInUsers = (): number[] => loggedInUsers;

const userService = {
  addUser,
  getUserProfileById,
  getUserByCredentials,
  getLoggedInUsers,
  loginUserFromChat,
  logoutUserFromChat,
};

export { messageService, userService };
