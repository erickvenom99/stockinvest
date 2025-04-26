'use client';
import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { UserContextType, User } from './user-context.types';

const TOKEN_CHECK_INTERVAL = 60000; // 60 seconds
const TOKEN_EXPIRATION_BUFFER = 30000; // 30 seconds

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  logout: () => {},
  fetchUser: async () => {},
});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Pick<UserContextType, 'user' | 'loading' | 'error'>>({
    user: null,
    loading: true,
    error: null,
  });

  const handleLogout = useCallback(() => {
    document.cookie = `authToken=; Path=/; Secure; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    setState(prev => ({
      ...prev,
      user: null,
      loading: false,
      error: null,
    }));
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/current-user', {
        credentials: 'include'
      });

      if (response.status === 401) {
        console.log('could not fetch user from api endpoint')
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = await response.json();
      setState(prev => ({
        ...prev,
        user: userData,
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      }));
      console.error('User fetch error:', err);
    }
  }, [handleLogout]);

  const checkToken = useCallback(() => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (!token) {
        handleLogout();
        return;
      }

      const { exp } = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() + TOKEN_EXPIRATION_BUFFER >= exp * 1000) {
        handleLogout();
      }
    } catch (e) {
      console.error('Token validation error:', e);
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUser();
    const checkAndSchedule = () => {
        checkToken();
        return setInterval(checkToken, 60000);
    };
    const interval = checkAndSchedule();
    return () => clearInterval(interval);
  }, [fetchUser, checkToken]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        logout: handleLogout,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}