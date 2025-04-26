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
        // 1. Call the logout API endpoint
        const response = await fetch("http://localhost:5000/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        // 2. Handle response
        if (!response.ok) {
          throw new Error("Logout failed on server");
        }

        // 3. Clear client-side token regardless of API response
        localStorage.removeItem("token");
        
        // 4. Redirect after short delay
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000); // Show message for 1 second
      } catch (err) {
        setError(err.message);
        // Still clear local token and redirect even if API fails
        localStorage.removeItem("token");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500); // Slightly longer delay to show error
      } finally {
        setLoading(false);
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="logout-container">
      {loading ? (
        <h2>Logging out...</h2>
      ) : error ? (
        <>
          <h2>Logout Error</h2>
          <p>{error}</p>
          <p>You have been logged out locally.</p>
        </>
      ) : (
        <>
          <h2>Logged Out Successfully</h2>
          <p>Redirecting to home page...</p>
        </>
      )}
    </div>
  );
};

export default Logout;