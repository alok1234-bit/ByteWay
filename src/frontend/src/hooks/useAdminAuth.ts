import { useCallback, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminRole = "admin" | "subadmin";

export interface SubadminAccount {
  id: string;
  username: string;
  password: string;
}

interface SessionData {
  role: AdminRole;
  username: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ADMIN_SESSION_KEY = "byteway_admin_session";
const SUBADMINS_STORE_KEY = "byteway_subadmins";

const ADMIN_CREDENTIALS = {
  username: "ALOK",
  password: "134221",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function writeSession(data: SessionData): void {
  try {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function readSubadmins(): SubadminAccount[] {
  try {
    const raw = localStorage.getItem(SUBADMINS_STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SubadminAccount[];
  } catch {
    return [];
  }
}

function writeSubadmins(list: SubadminAccount[]): void {
  try {
    localStorage.setItem(SUBADMINS_STORE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminAuth() {
  const [session, setSession] = useState<SessionData | null>(() =>
    readSession(),
  );

  const isAuthenticated = session !== null;
  const isAdmin = session?.role === "admin";
  const isSubadmin = session?.role === "subadmin";
  const currentUsername = session?.username ?? "";

  /** Attempts login. Returns the role on success, null on failure. */
  const loginAdmin = useCallback(
    (username: string, password: string): AdminRole | null => {
      // Check master admin first
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const data: SessionData = { role: "admin", username };
        writeSession(data);
        setSession(data);
        return "admin";
      }

      // Check subadmin list
      const subadmins = readSubadmins();
      const match = subadmins.find(
        (s) => s.username === username && s.password === password,
      );
      if (match) {
        const data: SessionData = { role: "subadmin", username };
        writeSession(data);
        setSession(data);
        return "subadmin";
      }

      return null;
    },
    [],
  );

  const logoutAdmin = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  // ─── Subadmin management (admin-only operations) ───────────────────────────

  const [subadmins, setSubadmins] = useState<SubadminAccount[]>(() =>
    readSubadmins(),
  );

  const refreshSubadmins = useCallback(() => {
    setSubadmins(readSubadmins());
  }, []);

  const addSubadmin = useCallback(
    (username: string, password: string): boolean => {
      const current = readSubadmins();
      if (current.find((s) => s.username === username)) return false; // duplicate
      const newAccount: SubadminAccount = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        username,
        password,
      };
      const updated = [...current, newAccount];
      writeSubadmins(updated);
      setSubadmins(updated);
      return true;
    },
    [],
  );

  const updateSubadmin = useCallback(
    (id: string, username: string, password: string): boolean => {
      const current = readSubadmins();
      // Check duplicate username (excluding self)
      if (current.find((s) => s.username === username && s.id !== id))
        return false;
      const updated = current.map((s) =>
        s.id === id ? { ...s, username, password } : s,
      );
      writeSubadmins(updated);
      setSubadmins(updated);
      return true;
    },
    [],
  );

  const deleteSubadmin = useCallback((id: string) => {
    const current = readSubadmins();
    const updated = current.filter((s) => s.id !== id);
    writeSubadmins(updated);
    setSubadmins(updated);
  }, []);

  return {
    isAuthenticated,
    isAdmin,
    isSubadmin,
    currentUsername,
    session,
    loginAdmin,
    logoutAdmin,
    subadmins,
    refreshSubadmins,
    addSubadmin,
    updateSubadmin,
    deleteSubadmin,
  };
}
