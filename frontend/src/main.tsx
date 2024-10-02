import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleProvider } from './context/RoleContext.tsx';
import AppRouter from './Router.tsx';
import './styles/global.scss';
import { ShortcutsProvider } from './context/ShortcutsContext.tsx';
import { Toaster } from 'react-hot-toast';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
export const toasterStyle: React.CSSProperties = {
	backgroundColor: prefersDark ? '#ccc' : '#fff',
	color: prefersDark ? '#fff' : '#ccc',
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ShortcutsProvider>
			<RoleProvider>
				<AppRouter />
				<Toaster position="top-center" reverseOrder={false} />
			</RoleProvider>
		</ShortcutsProvider>
	</StrictMode>
);
