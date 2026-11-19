import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); // start as loading
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to restore user from localStorage on app start
    const storedUser = localStorage.getItem("up");
    const storedToken = localStorage.getItem("wt");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // done checking localStorage
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
