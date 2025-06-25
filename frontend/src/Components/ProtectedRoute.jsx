import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ProtectedRoute component to restrict access based on user role.
 * 
 * @param {JSX.Element} children - Components to render if authorized
 * @param {string[]} allowedRoles - Array of allowed roles: ['admin', 'team', 'salesteam', 'productionteam']
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
      const role = sessionStorage.getItem("role");

      if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
        console.warn("⛔ Access denied. Redirecting to login...");
        navigate("/", { replace: true });
      } else {
        console.log("✅ Access granted for role:", role);
      }

      setIsLoading(false);
    };

    const timeout = setTimeout(checkAccess, 100);
    return () => clearTimeout(timeout);
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Checking access...</div>;
  }

  return children;
};

export default ProtectedRoute;
