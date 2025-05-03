import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful!");
        navigate("/home", { replace: true });
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("An error occurred during login");
    }
  };

  return (
    <div>
      <h1 className="app-title">Welcome</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <div className="button-container">
          <button type="submit" className="login-button">Login</button>
        </div>
      </form>
      {message && <p className="text-red-600">{message}</p>}
    </div>
  );
};

export default LoginForm;