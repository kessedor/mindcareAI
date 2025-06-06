import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Layout from './components/Layout';
import Button from './components/Button';

function App() {
  const throwTestError = () => {
    throw new Error('Sentry test error - This is intentional for testing purposes');
  };

  return (
    <BrowserRouter>
      <Layout>
        {/* Sentry Test Button - Remove in production */}
        <div className="fixed top-20 right-4 z-50">
          <Button 
            onClick={throwTestError}
            variant="outline"
            size="sm"
            className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
          >
            Test Sentry Error
          </Button>
        </div>
        
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;