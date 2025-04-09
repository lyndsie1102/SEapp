import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ContactManager from "./pages/ContactManager";
import ImageSearch from "./pages/ImageSearch";
import RegistrationForm from "./pages/RegistrationForm";
import LoginForm from "./pages/LoginForm";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
      <div className="nav">
        <Link to="/">Home</Link> |{" "}
        <Link to="/contacts">Contacts</Link> |{" "}
        <Link to="/images">Image Search</Link> |{" "}
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>

      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Default route */}
        <Route path="/contacts" element={<ContactManager />} />
        <Route path="/images" element={<ImageSearch />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
