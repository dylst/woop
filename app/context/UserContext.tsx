import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js'; // Import the Supabase User type

// Define the types for the User context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a UserProvider component to wrap the app
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Set user in context
  const setUser = (user: User | null) => {
    setUserState(user);
  };

  // Clear the user (used for logout)
  const clearUser = () => {
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  } 
  return context;
};
