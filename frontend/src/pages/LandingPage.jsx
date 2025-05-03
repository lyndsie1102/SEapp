import React, { useState, useEffect } from "react";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const LandingPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (location.state?.fromRegister) {
      setIsLogin(true); 
    }
  }, [location.state]);

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="image-section"></div>
        <div className="form-section">
          
          {message && <p className="text-red-600">{message}</p>}
          
          {isLogin ? <LoginForm /> : <RegistrationForm />}
          
          <div className="toggle-link">
            {isLogin ? (
              <p>
                Need an account?{" "}
                <Link to="#" onClick={() => setIsLogin(false)}>
                  Register
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link to="#" onClick={() => setIsLogin(true)}>
                  Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
