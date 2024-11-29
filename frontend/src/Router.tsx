// Router.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Auth';
import NotFound from './pages/Other/NotFound';
import PrivateRoute from './PrivateRoute';
import Unauthorized from './pages/Other/Unauthorized';
import Documents from './pages/Docs';
import Document from './pages/Docs/Document';
import Signup from './pages/Auth/Signup';
import ActivateUser from './pages/Auth/ActivateUser';
import Cookies from 'js-cookie';
import { useRoleContext } from './context/RoleContext';

const AppRouter: React.FC = () => {
	// const { registerShortcut, unregisterShortcut } = useShortcutsContext();
	const { setRole } = useRoleContext();
	const [loadedCookies, setLoadedCookies] = useState(false);

	useEffect(() => {
		const roleCookie = Cookies.get('role') as Role;
		console.log(roleCookie);

		setRole(roleCookie ?? 'guest');
		setLoadedCookies(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		loadedCookies && (
			<Router basename={import.meta.env.VITE_BASENAME}>
				<Routes>
					<Route
						path="/"
						element={
							<PrivateRoute
								component={<Login />}
								requiredRoles={['guest', 'user', 'admin']}
							/>
						}
					/>
					<Route
						path="/signup"
						element={<PrivateRoute component={<Signup />} requiredRoles={['guest']} />}
					/>
					<Route
						path="/activate"
						element={
							<PrivateRoute component={<ActivateUser />} requiredRoles={['guest']} />
						}
					/>
					<Route
						path="/documents"
						element={
							<PrivateRoute component={<Documents />} requiredRoles={['user']} />
						}
					/>
					<Route
						path="/documents/:documentId"
						element={<PrivateRoute component={<Document />} requiredRoles={['user']} />}
					/>
					<Route path="/unauthorized" element={<Unauthorized />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		)
	);
};

export default AppRouter;
