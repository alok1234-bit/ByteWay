import { useCallback, useState } from "react";

const ADMIN_SESSION_KEY = "byteway_admin_session";
const ADMIN_SESSION_VALUE = "authenticated_8f2k1p";

const VALID_CREDENTIALS = {
  username: "ALOK",
  password: "134221",
};

function checkSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === ADMIN_SESSION_VALUE;
  } catch {
    return false;
  }
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    checkSession(),
  );

  const loginAdmin = useCallback(
    (username: string, password: string): boolean => {
      if (
        username === VALID_CREDENTIALS.username &&
        password === VALID_CREDENTIALS.password
      ) {
        try {
          localStorage.setItem(ADMIN_SESSION_KEY, ADMIN_SESSION_VALUE);
        } catch {
          // localStorage unavailable — session still valid in memory
        }
        setIsAuthenticated(true);
        return true;
      }
      return false;
    },
    [],
  );

  const logoutAdmin = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  }, []);

  const isAdminAuthenticated = useCallback((): boolean => {
    return checkSession();
  }, []);

  return { isAuthenticated, loginAdmin, logoutAdmin, isAdminAuthenticated };
}
