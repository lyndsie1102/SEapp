import React, { useState } from "react";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import { Link } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="landing-page-image">
      <div className="form-card">
        <h1 className="app-title">Welcome to Huyen's App</h1>
        {isLogin ? <LoginForm /> : <RegistrationForm />}
        <div className="toggle-link">
          {isLogin ? (
            <p>
              Need an account?{" "}
              <Link to="/register" onClick={() => setIsLogin(false)}>
                Register
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link to="/login" onClick={() => setIsLogin(true)}>
                Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>

  );
};

export default LandingPage;
