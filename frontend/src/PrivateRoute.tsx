import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from './context/RoleContext';

interface PrivateRouteProps {
  component: JSX.Element;
  requiredRoles: Role[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component,
  requiredRoles,
}) => {
  const { role } = useRole();

  return requiredRoles.includes(role) ? (
    component
  ) : (
    <Navigate to="/unauthorized" />
  );
};

export default PrivateRoute;
