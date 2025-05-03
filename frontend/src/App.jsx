import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import LoginForm from '../pages/LoginForm';
import RegistrationForm from '../pages/RegistrationForm';
import ImageSearch from '../pages/ImageSearch';
import AudioSearch from '../pages/AudioSearch';
import RecentSearches from '../pages/RecentSearchesPage';

function App() {
  // Simulating authentication status (replace this with your actual logic)
  const isAuthenticated = true;

  // ProtectedRoute Component inside App.jsx
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />

        {/* Protected Routes */}
        <Route
          path="/home/*"
          element={<ProtectedRoute element={<HomePage />} />}
        >
          <Route path="" element={<div>Welcome to your dashboard!</div>} />
      
          <Route path="imagesearch" element={<ImageSearch />} />
          <Route path="audiosearch" element={<AudioSearch />} />
          <Route path="recentsearches" element={<RecentSearches />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
