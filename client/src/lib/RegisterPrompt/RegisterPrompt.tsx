import React, { FormEvent, useRef, useState } from "react";

import "./style.css";
import { UserDb, UserSession } from "../../types";
import { localStorageStore } from "../../store";

export const RegisterPrompt: React.FC = () => {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const fullNameRef = useRef(null);
  const passwordRef = useRef(null);

  const [registerSuccess, setRegisterSuccess] = useState(false);

  const submitRegisterForm = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !usernameRef.current ||
      !emailRef.current ||
      !fullNameRef.current ||
      !passwordRef.current
    ) {
      return;
    }

    const usernameInput = usernameRef.current as HTMLInputElement;
    const emailInput = emailRef.current as HTMLInputElement;
    const fullNameInput = fullNameRef.current as HTMLInputElement;
    const passwordInput = passwordRef.current as HTMLInputElement;

    const userData: Partial<UserDb> = {
      username: usernameInput.value,
      email: emailInput.value,
      fullName: fullNameInput.value,
      password: passwordInput.value,
    };

    // TODO: Use JWT
    const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const { message } = await response.json();
      console.info(message);
      setRegisterSuccess(true);
    }
  };

  return (
    <form className="register-form" onSubmit={submitRegisterForm}>
      <input ref={usernameRef} type="text" placeholder="Username" />
      <input ref={emailRef} type="text" placeholder="Email" />
      <input ref={fullNameRef} type="text" placeholder="Full Name" />
      <input ref={passwordRef} type="password" placeholder="Password" />
      <span className={registerSuccess ? "success" : "hidden"}>
        Registered successfully
      </span>
      <button type="submit">Sign up</button>
    </form>
  );
};
