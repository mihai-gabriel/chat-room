import { FormEvent, useRef } from "react";
import { UserDB } from "../types";

interface LoginPromptProps {
  setUserId: (userId: number) => void;
  setUsername: (username: string) => void;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
  setUserId,
  setUsername,
}) => {
  const username = useRef(null);
  const password = useRef(null);

  const submitLoginForm = async (e: FormEvent) => {
    e.preventDefault();

    if (!username.current || !password.current) return;

    const usernameInput = username.current as HTMLInputElement;
    const passwordInput = password.current as HTMLInputElement;

    const userData: UserDB = {
      username: usernameInput.value,
      password: passwordInput.value,
    };

    // TODO: Replace userId with userToken
    const responseData = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const responseJson = await responseData.json();

    console.log(responseData);

    if (responseData.status === 200) {
      const userId = Number(responseJson.userId);
      const username = responseJson.username;
      setUserId(userId);
      localStorage.setItem("userId", JSON.stringify(userId));
      setUsername(username);
      localStorage.setItem("username", JSON.stringify(username));
    }
  };

  return (
    <form onSubmit={submitLoginForm}>
      <input ref={username} type="text" placeholder="Username" />
      <input ref={password} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};
