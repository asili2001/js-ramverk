// Router.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import Login from './pages/Auth';
import NotFound from './pages/Other/NotFound';
import PrivateRoute from './PrivateRoute';
import Unauthorized from './pages/Other/Unauthorized';
import Documents from './pages/Docs';
import Document from './pages/Docs/Document';
import { useShortcutsContext } from './context/ShortcutsContext';
import Signup from './pages/Auth/Signup';
import ActivateUser from './pages/Auth/ActivateUser';
import Cookies from 'js-cookie';
import { useRoleContext } from './context/RoleContext';

const AppRouter: React.FC = () => {
	const { registerShortcut, unregisterShortcut } = useShortcutsContext();
	const { setRole } = useRoleContext();
	const [loadedCookies, setLoadedCookies] = useState(false);

	useEffect(() => {
		const roleCookie = Cookies.get('role') as Role;
		setRole(roleCookie ?? 'guest');
		setLoadedCookies(true);
	}, [setRole]);

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
		loadedCookies && (
			<Router basename="/~axjo21/editor">
				<Routes>
					<Route
						path="/"
						element={
							<PrivateRoute
								component={<Documents />}
								requiredRoles={['guest', 'user', 'admin']}
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
						path="/activate"
						element={
							<PrivateRoute
								component={<ActivateUser />}
								requiredRoles={['guest']}
							/>
						}
					/>
					<Route
						path="/documents"
						element={
							<PrivateRoute
								component={<Documents />}
								requiredRoles={['guest']}
							/>
						}
					/>
					<Route
						path="/documents/:documentId"
						element={
							<PrivateRoute
								component={<Document />}
								requiredRoles={['guest']}
							/>
						}
					/>
					<Route path="/unauthorized" element={<Unauthorized />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		)
	);
};

export default AppRouter;
