import React from 'react';
import { useAuth, Permission } from '../../context/AuthContext';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDisabledTooltip?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
  showDisabledTooltip = false,
}) => {
  const { can, role } = useAuth();
  const hasAccess = can(permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showDisabledTooltip) {
    return (
      <div 
        className="relative group inline-block cursor-not-allowed opacity-50 select-none"
        title={`Action restricted: Role '${role}' lacks '${permission}' permission.`}
      >
        <div className="pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};
