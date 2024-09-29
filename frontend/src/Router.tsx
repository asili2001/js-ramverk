// Router.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Auth';
import NotFound from './pages/Other/NotFound';
import PrivateRoute from './PrivateRoute';
import Unauthorized from './pages/Other/Unauthorized';
import Documents from './pages/Docs';
import Document from './pages/Docs/Document';
import { useShortcutsContext } from './context/ShortcutsContext';
import Signup from './pages/Auth/Signup';

const AppRouter: React.FC = () => {
	const { registerShortcut, unregisterShortcut } = useShortcutsContext();

	useEffect(() => {
		registerShortcut(
			['Ctrl', 'o'],
			() => alert('Open action triggered!'),
			'Open'
		);
		registerShortcut(
			['Ctrl', 'f'],
			() => alert('New action triggered!'),
			'New'
		);
		registerShortcut(
			['Ctrl', '<'],
			() => alert('Share action triggered!'),
			'Share'
		);
		registerShortcut(
			['Ctrl', 'z'],
			() => alert('Undo action triggered!'),
			'Undo'
		);
		registerShortcut(
			['Ctrl', 'y'],
			() => alert('Redo action triggered!'),
			'Redo'
		);

		return () => {
			unregisterShortcut(['Ctrl', 's']);
			unregisterShortcut(['Ctrl', 'f']);
		};
	}, [registerShortcut, unregisterShortcut]);

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<PrivateRoute
							component={<Login />}
							requiredRoles={['guest']}
						/>
					}
				/>
				<Route
					path="/signup"
					element={
						<PrivateRoute
							component={<Signup />}
							requiredRoles={['guest']}
						/>
					}
				/>
				<Route
					path="/documents"
					element={
						<PrivateRoute
							component={<Documents />}
							requiredRoles={['user']}
						/>
					}
				/>
				<Route
					path="/documents/:documentId"
					element={
						<PrivateRoute
							component={<Document />}
							requiredRoles={['user']}
						/>
					}
				/>
				<Route path="/unauthorized" element={<Unauthorized />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	);
};

export default AppRouter;
