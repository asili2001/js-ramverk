// Router.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/Other/NotFound';
import PrivateRoute from './PrivateRoute';
import Unauthorized from './pages/Other/Unauthorized';
import Documents from './pages/Docs';
import Document from './pages/Docs/Document';
import useShortCuts from './utils/useShortCuts';

const AppRouter: React.FC = () => {
  const { registerShortcut } = useShortCuts();

  useEffect(() => {
    registerShortcut(
      ['Ctrl', 's'],
      () => alert('Save action triggered!'),
      'Save'
    );
  }, [registerShortcut]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute component={<Home />} requiredRoles={['guest']} />
          }
        />
        <Route
          path="/documents"
          element={
            <PrivateRoute component={<Documents />} requiredRoles={['guest']} />
          }
        />
        <Route
          path="/documents/:documentId"
          element={
            <PrivateRoute component={<Document />} requiredRoles={['guest']} />
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
