type Listener = () => void;
interface localStorageType {
  username?: string;
  userId?: number;
}

const getLocalStorageOnInit = () => {
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  if (!userId || !username) return {};

  return { username: JSON.parse(username || ""), userId: Number(userId) };
};

let localStorageData: localStorageType = getLocalStorageOnInit();
let listeners: Listener[] = [];

export const localStorageStore = {
  setUser({ userId, username }: { userId: string; username: string }) {
    localStorage.setItem("username", JSON.stringify(username));
    localStorage.setItem("userId", JSON.stringify(userId));
    localStorageData = { userId: Number(userId), username };
    emitChange();
  },
  clearLocalStorage() {
    localStorage.clear();
    localStorageData = {};
    emitChange();
  },
  subscribe(listener: Listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return localStorageData;
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}
