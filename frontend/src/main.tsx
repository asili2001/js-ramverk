import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RoleProvider } from './context/RoleContext.tsx';
import AppRouter from './Router.tsx';
import './styles/global.scss';
import { ShortcutsProvider } from './context/ShortcutsContext.tsx';
import { Toaster } from 'react-hot-toast';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
export const toasterStyle: React.CSSProperties = {
	backgroundColor: prefersDark ? '#ccc' : '#fff',
	color: prefersDark ? '#fff' : '#ccc',
};

const client = new ApolloClient({
	link: new HttpLink({
		uri: import.meta.env.VITE_GQL_API_URL,
		credentials: 'include',
	}),
	cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<ShortcutsProvider>
				<RoleProvider>
					<AppRouter />
					<Toaster position="top-center" reverseOrder={false} />
				</RoleProvider>
			</ShortcutsProvider>
		</ApolloProvider>
	</StrictMode>
);
