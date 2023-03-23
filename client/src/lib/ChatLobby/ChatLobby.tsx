import React, { useSyncExternalStore } from "react";
import { localStorageStore } from "../../store";
import { Chat } from "../Chat";

import "./style.css";

export const ChatLobby: React.FC = () => {
  const localStorageData = useSyncExternalStore(
    localStorageStore.subscribe,
    localStorageStore.getSnapshot
  );

  return (
    <div className="chat-lobby-container">
      <h2>
        Logged in as{" "}
        <span className="highlight-username">
          {localStorageData.user?.username}
        </span>
      </h2>
      <a
        role="button"
        className="logout"
        onClick={localStorageStore.clearLocalStorage}
      >
        Logout
      </a>
      <Chat />
    </div>
  );
};
