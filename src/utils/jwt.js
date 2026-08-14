/**
 * Lightweight JWT helpers.
 *
 * The auth flow (Keycloak) returns an access token whose payload carries the
 * user identity — `preferred_username`, `email`, `sub`, roles — even though the
 * login response body itself only contains the token + expiry fields. These
 * helpers decode that payload (no signature verification, which the backend
 * already performs) so the UI can show a real profile instead of "Account".
 */

const base64UrlDecode = (segment) => {
  let value = (segment || "").replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4 !== 0) value += "=";
  const raw = atob(value);
  // Convert the byte string into UTF-8 (handles non-ASCII in the payload).
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

/** Decodes the payload of a JWT. Returns null on any malformed input. */
export const decodeJwt = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
};

/** Reads the persisted access token (client-side only). */
export const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token") || null;
  } catch {
    return null;
  }
};

/**
 * Maps a (Keycloak) JWT payload onto the profile shape `userProfile.js`
 * expects. Roles from `realm_access` and `resource_access.account` are joined
 * for display.
 */
export const userFromJwt = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  const realmRoles = Array.isArray(payload.realm_access?.roles)
    ? payload.realm_access.roles
    : [];
  const accountRoles = Array.isArray(payload.resource_access?.account?.roles)
    ? payload.resource_access.account.roles
    : [];
  const roles = [...realmRoles, ...accountRoles];

  const username = payload.preferred_username || null;
  const email = payload.email || null;

  return {
    preferred_username: username,
    username,
    name: payload.name || username || null,
    email,
    email_verified: payload.email_verified,
    sub: payload.sub || null,
    role: roles.length > 0 ? roles.join(", ") : null,
    roles,
    realm: payload.iss || null,
  };
};

/** Decodes the stored token (if any) and returns the mapped user object. */
export const getCurrentUserFromToken = () => {
  const token = getToken();
  return token ? userFromJwt(decodeJwt(token)) : null;
};

/** True when a (non-expired) access token is present. */
export const hasValidSession = () => {
  const token = getToken();
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
};
