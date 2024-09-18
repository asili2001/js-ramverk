import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleProvider } from './context/RoleContext.tsx';
import AppRouter from './Router.tsx';
import './styles/global.scss';
import { ShortcutsProvider } from './context/ShortcutsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShortcutsProvider>
      <RoleProvider>
        <AppRouter />
      </RoleProvider>
    </ShortcutsProvider>
  </StrictMode>
);
