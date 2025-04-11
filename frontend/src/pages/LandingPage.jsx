import React, { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import { Link } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="landing-page-image">
      <h1>Welcome to Huyen's App</h1>
      {isLogin ? <LoginForm /> : <RegistrationForm />}
      <div>
        <p>Need an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default LandingPage;
