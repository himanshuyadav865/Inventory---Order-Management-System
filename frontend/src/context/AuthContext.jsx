import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking an authenticated user
    setCurrentUser({ uid: 'mock-user-123', email: 'test@example.com' });
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setCurrentUser({ uid: 'mock-user-123', email });
  };

  const signup = async (email, password) => {
    setCurrentUser({ uid: 'mock-user-123', email });
  };

  const logout = async () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
