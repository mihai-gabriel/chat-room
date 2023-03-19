import React, { FormEvent, useRef, useState } from "react";
import { UserDB } from "../../types";

import "./style.css";

export const RegisterPrompt: React.FC = () => {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [registerSuccess, setRegisterSuccess] = useState(false);

  const submitRegisterForm = async (e: FormEvent) => {
    e.preventDefault();

    if (!usernameRef.current || !passwordRef.current) return;

    const usernameInput = usernameRef.current as HTMLInputElement;
    const passwordInput = passwordRef.current as HTMLInputElement;

    const userData: UserDB = {
      username: usernameInput.value,
      password: passwordInput.value,
    };

    // TODO: Replace userId with userToken
    const responseData = await fetch(
      `${import.meta.env.VITE_API_URL}/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }
    );

    if (responseData.status === 201) {
      setRegisterSuccess(true);
    }
  };

  return (
    <form className="register-form" onSubmit={submitRegisterForm}>
      <input ref={usernameRef} type="text" placeholder="Username" />
      <input ref={passwordRef} type="password" placeholder="Password" />
      <span className={registerSuccess ? "success" : "hidden"}>
        Registered successfully
      </span>
      <button type="submit">Sign up</button>
    </form>
  );
};
