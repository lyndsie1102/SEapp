import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ContactManager from "./pages/ContactManager";
import ImageSearch from "./pages/ImageSearch";
import RegistrationForm from "./pages/RegistrationForm";
import LoginForm from "./pages/LoginForm";

function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/">Contacts</Link> |{" "}
        <Link to="/images">Image Search</Link> |{" "}
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>

      <Routes>
        <Route path="/" element={<ContactManager />} />
        <Route path="/images" element={<ImageSearch />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
