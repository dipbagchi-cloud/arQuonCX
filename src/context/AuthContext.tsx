import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export type RoleName = 'SUPER_ADMIN' | 'CS_OPS' | 'CSM' | 'PRODUCT_GROWTH' | 'VIEWER';

export type Permission =
  | 'account:read'
  | 'account:write'
  | 'account:delete'
  | 'account:touchpoint'
  | 'flow:read'
  | 'flow:write'
  | 'flow:publish'
  | 'flow:delete'
  | 'survey:read'
  | 'survey:write'
  | 'survey:publish'
  | 'survey:triage'
  | 'analytics:read'
  | 'analytics:export'
  | 'analytics:tag'
  | 'resource_center:read'
  | 'resource_center:manage'
  | 'integrations:manage'
  | 'api_keys:manage'
  | 'team:manage'
  | 'audit:read';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: RoleName;
  title: string;
  organization?: {
    id: string;
    name: string;
    plan: string;
  };
}

export const ROLE_PERSONAS: Record<RoleName, UserProfile> = {
  SUPER_ADMIN: {
    id: 'user_admin',
    email: 'admin@arquoncx.io',
    name: 'Dr. Aris Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN',
    title: 'VP of Customer Success & Operations',
    organization: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      plan: 'Enterprise',
    },
  },
  CS_OPS: {
    id: 'user_csops',
    email: 'csops@arquoncx.io',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'CS_OPS',
    title: 'CS Operations & Data Analyst',
    organization: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      plan: 'Enterprise',
    },
  },
  CSM: {
    id: 'user_csm',
    email: 'elena@arquoncx.io',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    role: 'CSM',
    title: 'Lead Enterprise CSM',
    organization: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      plan: 'Enterprise',
    },
  },
  PRODUCT_GROWTH: {
    id: 'user_product',
    email: 'product@arquoncx.io',
    name: 'Sophia Lindqvist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'PRODUCT_GROWTH',
    title: 'Head of Product Growth & Onboarding',
    organization: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      plan: 'Enterprise',
    },
  },
  VIEWER: {
    id: 'user_viewer',
    email: 'viewer@arquoncx.io',
    name: 'Alex Wright',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'VIEWER',
    title: 'Sales & Executive Stakeholder (Viewer)',
    organization: {
      id: 'org_arquoncx',
      name: 'arQuonCX Global',
      plan: 'Enterprise',
    },
  },
};

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [
    'account:read', 'account:write', 'account:delete', 'account:touchpoint',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish', 'survey:triage',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
    'integrations:manage', 'api_keys:manage', 'team:manage', 'audit:read',
  ],
  CS_OPS: [
    'account:read', 'account:write', 'account:delete', 'account:touchpoint',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish', 'survey:triage',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
    'integrations:manage', 'api_keys:manage', 'team:manage', 'audit:read',
  ],
  CSM: [
    'account:read', 'account:write', 'account:touchpoint',
    'flow:read',
    'survey:read', 'survey:triage',
    'analytics:read', 'analytics:export',
    'resource_center:read',
  ],
  PRODUCT_GROWTH: [
    'account:read',
    'flow:read', 'flow:write', 'flow:publish', 'flow:delete',
    'survey:read', 'survey:write', 'survey:publish',
    'analytics:read', 'analytics:export', 'analytics:tag',
    'resource_center:read', 'resource_center:manage',
  ],
  VIEWER: [
    'account:read',
    'flow:read',
    'survey:read',
    'analytics:read',
    'resource_center:read',
  ],
};

interface AuthContextType {
  user: UserProfile;
  role: RoleName;
  token: string | null;
  permissions: Permission[];
  isLoading: boolean;
  isLiveApi: boolean;
  can: (permission: Permission) => boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: RoleName) => Promise<void>;
  toggleLiveMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<RoleName>('SUPER_ADMIN');
  const [user, setUser] = useState<UserProfile>(ROLE_PERSONAS.SUPER_ADMIN);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('arquoncx_token'));
  const [permissions, setPermissions] = useState<Permission[]>(ROLE_PERMISSIONS.SUPER_ADMIN);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      try {
        const storedToken = localStorage.getItem('arquoncx_token');
        if (storedToken) {
          const res = await api.auth.me();
          if (res.success && res.user) {
            const normalizedRole = (res.user.role || 'SUPER_ADMIN') as RoleName;
            setUser(res.user);
            setRole(normalizedRole);
            setPermissions(ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.SUPER_ADMIN);
            setIsLiveApi(true);
            return;
          }
        }

        // Auto login as default admin for live connection
        const loginRes = await api.auth.login('admin@arquoncx.io', 'password123');
        if (loginRes.success) {
          localStorage.setItem('arquoncx_token', loginRes.token);
          setToken(loginRes.token);
          const normalizedRole = (loginRes.user.role || 'SUPER_ADMIN') as RoleName;
          setUser(loginRes.user);
          setRole(normalizedRole);
          setPermissions(ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.SUPER_ADMIN);
          setIsLiveApi(true);
        }
      } catch (err) {
        console.warn('Backend API connection notice, running with local persona state:', err);
        setIsLiveApi(false);
      }
    }

    initSession();
  }, []);

  const can = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success) {
        localStorage.setItem('arquoncx_token', res.token);
        setToken(res.token);
        const normalizedRole = (res.user.role || 'SUPER_ADMIN') as RoleName;
        setUser(res.user);
        setRole(normalizedRole);
        setPermissions(ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.SUPER_ADMIN);
        setIsLiveApi(true);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('arquoncx_token');
    setToken(null);
    setUser(ROLE_PERSONAS.VIEWER);
    setRole('VIEWER');
    setPermissions(ROLE_PERMISSIONS.VIEWER);
  };

  const switchRole = async (newRole: RoleName) => {
    // 1. Immediately and synchronously update local state for zero-latency UI re-render
    const persona = ROLE_PERSONAS[newRole] || ROLE_PERSONAS.SUPER_ADMIN;
    setUser(persona);
    setRole(newRole);
    setPermissions(ROLE_PERMISSIONS[newRole] || []);

    // 2. Asynchronously notify backend and re-issue JWT token
    try {
      const res = await api.auth.switchRole(newRole);
      if (res.success && res.token) {
        localStorage.setItem('arquoncx_token', res.token);
        setToken(res.token);
      }
    } catch (err) {
      console.warn('Backend role switch notice (running in instant persona mode):', err);
    }
  };

  const toggleLiveMode = () => {
    setIsLiveApi(prev => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        permissions,
        isLoading,
        isLiveApi,
        can,
        login,
        logout,
        switchRole,
        toggleLiveMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
