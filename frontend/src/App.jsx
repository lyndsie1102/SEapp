import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginForm from './pages/LoginForm';
import RegistrationForm from './pages/RegistrationForm';
import ProtectedRoute from './components/ProtectRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
      </Routes>
    </Router>
  );
}

export default App;
