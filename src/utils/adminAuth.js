/**
 * Admin console session.
 *
 * The admin console is deliberately separate from the end-user (Keycloak)
 * session: it uses a static local credential and is never advertised in the
 * regular workspace navigation.
 */

const ADMIN_KEY = "admin_authed";
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "admin";

export const isAdminAuthed = () => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ADMIN_KEY) === "true";
  } catch {
    return false;
  }
};

/** Verifies the static credentials and persists the session flag. */
export const adminLogin = (username, password) => {
  const ok =
    String(username || "").trim() === ADMIN_USERNAME &&
    String(password || "") === ADMIN_PASSWORD;
  if (ok && typeof window !== "undefined") {
    try {
      localStorage.setItem(ADMIN_KEY, "true");
    } catch {
      /* storage unavailable — session lasts for this page only */
    }
  }
  return ok;
};

export const adminLogout = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* noop */
  }
};
