import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { routes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {routes}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

