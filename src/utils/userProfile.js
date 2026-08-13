/**
 * Maps a login/register payload onto the handful of fields it is safe
 * (and useful) to show a person about themselves. Tokens, secrets and
 * internal identifiers stay out of the UI.
 */

const FIELD_DEFS = [
  { label: "Full name", keys: ["name", "full_name", "fullName", "displayName", "display_name"] },
  { label: "Username", keys: ["username", "user_name", "userName", "preferred_username"] },
  { label: "Email", keys: ["email", "email_id", "mail", "emailAddress"] },
  { label: "Role", keys: ["role", "user_role", "userRole", "job_title", "title"] },
  { label: "Organization", keys: ["organization", "org", "company", "tenant", "workspace"] },
];

const HIDDEN_KEY = /token|password|secret|hash|refresh|access_|id_token|authorization/i;

const firstString = (source, keys) => {
  if (!source || typeof source !== "object") return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export const getDisplayName = (user) => {
  const name = firstString(user, FIELD_DEFS[0].keys);
  if (name) return name;
  const username = firstString(user, FIELD_DEFS[1].keys);
  if (username) return username;
  const email = firstString(user, FIELD_DEFS[2].keys);
  if (email) return email.split("@")[0];
  return "Account";
};

export const getEmail = (user) => firstString(user, FIELD_DEFS[2].keys);

export const getUsername = (user) => firstString(user, FIELD_DEFS[1].keys);

export const getInitials = (user) => {
  const name = getDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/** Public-facing rows for the settings page. Empty values are omitted. */
export const getPublicProfileFields = (user) => {
  if (!user || typeof user !== "object") return [];
  return FIELD_DEFS.map(({ label, keys }) => ({
    label,
    value: firstString(user, keys),
  })).filter((row) => row.value && !HIDDEN_KEY.test(row.label));
};

export const sanitizeUserPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  const next = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (HIDDEN_KEY.test(key)) return;
    if (value === null || value === undefined) return;
    if (typeof value === "object") return;
    next[key] = value;
  });
  return next;
};
