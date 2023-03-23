import { FormEvent, useRef, useSyncExternalStore } from "react";
import { User, UserDb, UserSession } from "../../types";
import { localStorageStore } from "../../store";

import "./style.css";

export const LoginPrompt: React.FC = () => {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const submitLoginForm = async (e: FormEvent) => {
    e.preventDefault();

    if (!usernameRef.current || !passwordRef.current) return;

    const usernameInput = usernameRef.current as HTMLInputElement;
    const passwordInput = passwordRef.current as HTMLInputElement;

    const userData: Partial<UserDb> = {
      username: usernameInput.value,
      password: passwordInput.value,
    };

    // TODO: Use JWT
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const session: UserSession = await response.json();
      localStorageStore.setSession(session);
    }
  };

  return (
    <form className="login-form" onSubmit={submitLoginForm}>
      <input ref={usernameRef} type="text" placeholder="Username" />
      <input ref={passwordRef} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};
