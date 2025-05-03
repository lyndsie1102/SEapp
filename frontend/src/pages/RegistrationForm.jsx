import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address");
      console.log(error);
      return;
    }


    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to landing page with login form active and success message
      navigate("/", { state: { fromRegister: true } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="app-title">Registration</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-field">
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Email"
            required
          />
        </div>
        <div className="form-field">
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Password"
            required
          />
        </div>
        <div className="form-field">
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            placeholder="Confirm Password"
            required
          />
        </div>
        <div className="button-container">
          <button type="submit" className="register-button">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
