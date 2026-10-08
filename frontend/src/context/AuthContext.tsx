import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  sendOtp: (phone: string) => Promise<{ cooldown_seconds: number; demo_hint?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  switchRoleQuick: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  security_officer: [
    'view_dashboard', 'view_cameras', 'view_live_streams', 'search_events',
    'use_ai_investigation', 'view_person_journey', 'view_evidence', 'view_alerts',
    'acknowledge_alerts', 'basic_analytics'
  ],
  security_manager: [
    'view_dashboard', 'view_cameras', 'view_live_streams', 'search_events',
    'use_ai_investigation', 'view_person_journey', 'view_evidence', 'view_alerts',
    'acknowledge_alerts', 'manage_alerts', 'manage_cameras', 'manage_security_users',
    'view_reports', 'create_reports', 'advanced_analytics', 'view_audit_logs'
  ],
  campus_admin: [
    'view_dashboard', 'view_security_status', 'view_major_incidents',
    'view_reports', 'view_analytics', 'view_camera_status'
  ],
  investigation_team: [
    'view_dashboard', 'search_historical_video', 'use_ai_investigation',
    'view_person_journey', 'view_event_timeline', 'view_evidence',
    'export_investigation_report', 'create_reports', 'view_reports', 'incident_analytics'
  ]
};

// Preset demo phone profiles for rapid testing
export const DEMO_PROFILES: Record<UserRole, { phone: string; name: string; title: string; otp: string }> = {
  security_officer: {
    phone: '+919876543210',
    name: 'Vikram Rathore',
    title: 'Senior CCTV Operator',
    otp: '123456'
  },
  security_manager: {
    phone: '+919876543211',
    name: 'Priya Sharma',
    title: 'Head of Security Operations',
    otp: '123456'
  },
  campus_admin: {
    phone: '+919876543212',
    name: 'Dr. Arvind Patel',
    title: 'Campus Infrastructure Director',
    otp: '123456'
  },
  investigation_team: {
    phone: '+919876543213',
    name: 'Inspector Rajesh Nair',
    title: 'Lead Forensic Investigator',
    otp: '123456'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('multistream_session_token');
      if (token) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
        } catch (e) {
          localStorage.removeItem('multistream_session_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const sendOtp = async (phone: string) => {
    setError(null);
    try {
      const res = await api.sendOtp(phone);
      return { cooldown_seconds: res.cooldown_seconds, demo_hint: res.demo_hint };
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      throw err;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setError(null);
    try {
      const res = await api.verifyOtp(phone, otp);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      throw err;
    }
  };

  const switchRoleQuick = async (targetRole: UserRole) => {
    setError(null);
    const demo = DEMO_PROFILES[targetRole];
    try {
      // Direct login with preset demo profile
      await verifyOtp(demo.phone, demo.otp);
    } catch (err: any) {
      setError(err.message || 'Role switch failed');
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('multistream_session_token');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    const perms = ROLE_PERMISSIONS[user.role] || [];
    return perms.includes(permission);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        error,
        sendOtp,
        verifyOtp,
        switchRoleQuick,
        logout,
        hasPermission,
        clearError
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
