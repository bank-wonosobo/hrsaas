import { User } from "@/schema/user-schema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  setUser: async () => {},
});

const TOKEN_KEY = "token";
const USER_KEY = "user";

const normalizeToken = (token: string) => token.split(",token=", 1)[0];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken) {
        const normalizedToken = normalizeToken(storedToken);
        setToken(normalizedToken);
        if (normalizedToken !== storedToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, normalizedToken);
        }
      }

      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (token: string, user: User) => {
    const normalizedToken = normalizeToken(token);

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, normalizedToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);

    setToken(normalizedToken);
    setUserState(user);
  };

  const signOut = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);

    setToken(null);
    setUserState(null);
  };

  const setUser = async (user: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    setUserState(user);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signIn,
        signOut,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
