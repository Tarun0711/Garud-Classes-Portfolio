import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole");
    const storedUsername = localStorage.getItem("username");

    if (authStatus === "true" && storedRole && storedUsername) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      setUsername(storedUsername);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try backend login first (interpreting username field as email for backend)
      const { backendLogin } = await import('../lib/api');
      const backendResult = await backendLogin(username, password);
      if (backendResult) {
        const role = 'admin';
        localStorage.setItem('authToken', backendResult.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("username", backendResult.name || username);
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(backendResult.name || username);
        return true;
      }

      // Fallback demo auth
      await new Promise(resolve => setTimeout(resolve, 500));
      if (username === "admin" && password === "admin123") {
        const role = "admin";
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", role);
        localStorage.setItem("username", username);
        setIsAuthenticated(true);
        setUserRole(role);
        setUsername(username);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    // Clear authentication state
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    localStorage.removeItem('authToken');
    
    // Update state
    setIsAuthenticated(false);
    setUserRole(null);
    setUsername(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    userRole,
    username,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
