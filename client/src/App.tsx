import React, { useEffect, useState } from "react";
import { Chat } from "./lib";
import { LoginPrompt } from "./lib/LoginPrompt";

export default function App() {
  const [hideChat, setHideChat] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const [pollUsersStatus, setPollUsersStatus] = useState(null);

  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    const localUsername = localStorage.getItem("username");

    localUserId && setUserId(Number(localUserId));
    localUsername && setUsername(JSON.parse(localUsername));
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUserId(null);
  };

  return (
    <>
      {userId === null && (
        <LoginPrompt setUserId={setUserId} setUsername={setUsername} />
      )}
      {userId !== null && (
        <>
          <h3>Logged in as {username}</h3>
          <button onClick={logout}>Logout</button>
          <button onClick={() => setHideChat((prev) => !prev)}>Toggle</button>
          {!hideChat && <Chat userId={userId} />}
        </>
      )}
    </>
  );
}
