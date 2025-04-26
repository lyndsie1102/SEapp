// src/pages/Logout.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch("http://localhost:5000/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Logout failed on server.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        localStorage.removeItem("token");
        // Step 1: Show spinner briefly
        setTimeout(() => {
          setLoading(false); // Will trigger render of error or continue to redirect
        }, 300); // Let the spinner show up
      }
    };

    performLogout();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);

  return (
    <div className="logout-container">
      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          <h2>Logout Error</h2>
          <p>{error}</p>
          <p>You have been logged out locally.</p>
        </div>
      ) : null}
    </div>
  );
};
export default Logout;