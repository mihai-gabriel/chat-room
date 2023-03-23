import { User, UserSession } from "../types";

type Listener = () => void;

const getLocalStorageOnInit = () => {
  const localUser = localStorage.getItem("user");
  const localRoomId = localStorage.getItem("roomId");

  if (!localUser || !localRoomId) return {};

  const user = JSON.parse(localUser) as User;
  const roomId = JSON.parse(localRoomId) as string;

  return { user, roomId };
};

let localStorageData: Partial<UserSession> = getLocalStorageOnInit();
let listeners: Listener[] = [];

export const localStorageStore = {
  setSession({ user, roomId }: UserSession) {
    // make auth persistent locally
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("roomId", JSON.stringify(roomId));

    // trigger UI real-time update
    localStorageData = { user, roomId };
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
  // Note: Calling a listener forces the UI component to re-render.
  listeners.forEach((listener) => listener());
}
