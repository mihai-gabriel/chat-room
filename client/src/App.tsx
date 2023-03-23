import React, { useSyncExternalStore } from "react";
import { ChatLobby, Landing } from "./lib";
import { localStorageStore } from "./store";

export default function App() {
  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );
  const isAuthenticated = localStorageData.user !== undefined;

  return isAuthenticated ? <ChatLobby /> : <Landing />;
}
