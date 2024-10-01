import { Navigate } from 'react-router-dom';
import { useRoleContext } from './context/RoleContext';

interface PrivateRouteProps {
	component: JSX.Element;
	requiredRoles: Role[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
	component,
	requiredRoles,
}) => {
	const { role } = useRoleContext();

	return role && requiredRoles.includes(role) ? (
		component
	) : (
		<Navigate to="/" />
	);
};

export default PrivateRoute;
