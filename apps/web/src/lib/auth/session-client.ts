export interface CommunitySession {
  clubId: string;
  clubSlug: string;
  clubName: string;
  captainName: string;
  phone: string;
  iat: number;
  exp: number;
  jti: string;
}

export const SESSION_TOKEN_STORAGE_KEY = "kickpro_session_token";
export const SESSION_DATA_STORAGE_KEY = "kickpro_session_data";

export function getClientSession(): { token: string | null; session: CommunitySession | null } {
  if (typeof window === "undefined") {
    return { token: null, session: null };
  }
  try {
    const token = window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
    const rawSession = window.localStorage.getItem(SESSION_DATA_STORAGE_KEY);
    if (!rawSession) return { token: null, session: null };
    const session = JSON.parse(rawSession) as CommunitySession;
    if (session.exp * 1000 < Date.now()) {
      clearClientSession();
      return { token: null, session: null };
    }
    return { token, session };
  } catch {
    return { token: null, session: null };
  }
}

export function setClientSession(token: string, session: CommunitySession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(SESSION_DATA_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("kickpro-session-change"));
  } catch {
    // Ignore storage error
  }
}

export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_DATA_STORAGE_KEY);
    window.dispatchEvent(new Event("kickpro-session-change"));
  } catch {
    // Ignore storage error
  }
}

export async function logoutCommunitySession(): Promise<void> {
  clearClientSession();
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // Ignore network error
  }
}
