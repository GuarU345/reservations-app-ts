import { useCallback, useMemo, useState } from "react";

import * as authApi from "@/api/auth";
import { storage } from "@/lib/storage";
import type {
  AuthResponse,
  AuthStatus,
  SignInPayload,
  SignUpPayload,
} from "@/types/auth";

import { AuthContext } from "./auth-context";

type AuthProviderProps = {
  children: React.ReactNode;
};

const resolveInitialState = () => {
  const session = storage.getSession();

  if (!session) {
    return {
      user: null,
      token: null,
      status: "unauthenticated" as AuthStatus,
    };
  }

  return {
    user: session.user,
    token: session.token,
    status: "authenticated" as AuthStatus,
  };
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [{ user, token, status }, setState] = useState(resolveInitialState);

  const persistSession = useCallback((session: AuthResponse) => {
    storage.setSession(session);
    setState({
      user: session.user,
      token: session.token,
      status: "authenticated",
    });
  }, []);

  const clearSession = useCallback(() => {
    storage.clearSession();
    setState({
      user: null,
      token: null,
      status: "unauthenticated",
    });
  }, []);

  const login = useCallback(
    async (payload: SignInPayload) => {
      setState((current) => ({ ...current, status: "loading" }));
      try {
        const session = await authApi.signin(payload);
        persistSession(session);
        return session;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, persistSession]
  );

  const register = useCallback(
    async (payload: SignUpPayload) => {
      setState((current) => ({ ...current, status: "loading" }));
      try {
        const newUser = await authApi.signup(payload);
        setState((current) => ({ ...current, status: "unauthenticated" }));
        return newUser;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const setSession = useCallback(
    (session: AuthResponse) => {
      persistSession(session);
    },
    [persistSession]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      status: status as AuthStatus,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
      setSession,
    }),
    [login, logout, register, setSession, status, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
