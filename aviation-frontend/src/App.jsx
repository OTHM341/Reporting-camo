import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <Router>
      <AppDataProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AppDataProvider>
    </Router>
  );
}

export default App;