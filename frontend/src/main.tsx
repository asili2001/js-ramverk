import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleProvider } from './context/RoleContext.tsx';
import AppRouter from './Router.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoleProvider>
      <AppRouter />
    </RoleProvider>
    ,
  </StrictMode>
);
