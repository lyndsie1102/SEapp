import React, { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="landing-page">
      <h1>Welcome to Our App</h1>
      <div className="form-toggle">
        <button onClick={() => setIsLogin(true)}>Login</button>
        <button onClick={() => setIsLogin(false)}>Register</button>
      </div>
      {isLogin ? <LoginForm /> : <RegistrationForm />}
      <div>
        <p>Or, if you have an account, <Link to="/login">login here</Link></p>
        <p>Need an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default LandingPage;
