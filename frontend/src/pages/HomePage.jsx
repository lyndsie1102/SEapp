import ContactManager from './ContactManager';
import ImageSearch from './ImageSearch';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <ContactManager /> {/* Will only be accessible if user is logged in */}
      <ImageSearch /> {/* Will only be accessible if user is logged in */}
    </div>
  );
};

export default HomePage;
