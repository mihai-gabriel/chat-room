import React, { useSyncExternalStore } from "react";
import { ChatLobby, Landing } from "./lib";
import { localStorageStore } from "./store";

export default function App() {
  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );
  const userLoggedIn = localStorageData.userId !== undefined;

  return userLoggedIn ? <ChatLobby /> : <Landing />;
}
