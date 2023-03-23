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
      <div className="form-field">
        <input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          minLength={3}
        />
        <span className="help-text">Must be unique. At least 3 characters</span>
      </div>

      <div className="form-field">
        <input ref={emailRef} type="email" placeholder="Email" minLength={5} />
        <span className="help-text">e.g. example@server.com</span>
      </div>

      <div className="form-field">
        <input
          ref={fullNameRef}
          type="text"
          placeholder="Full Name"
          minLength={5}
        />
        <span className="help-text">e.g. John Smith.</span>
      </div>

      <div className="form-field">
        <input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          minLength={5}
        />
        <span className="help-text">At least 5 characters</span>
      </div>

      <span className={registerSuccess ? "success" : "hidden"}>
        Registered successfully
      </span>
      <button type="submit">Sign up</button>
    </form>
  );
};
