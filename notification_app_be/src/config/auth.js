// ============================================================
// AUTH CONFIG — Token Management for Evaluation Service
// Token TTL is ~15 minutes, so we refresh aggressively
// ============================================================

import axios from "axios";

let cachedToken = null;
let tokenFetchedAt = 0;
const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // Refresh every 10 min

/**
 * Fetch a Bearer token from the evaluation service.
 * Caches the token and auto-refreshes when it's about to expire.
 *
 * @returns {Promise<string|null>} The access token or null on failure
 */
export async function getAuthToken() {
  const now = Date.now();

  // A — Return cached token if still fresh
  if (cachedToken && (now - tokenFetchedAt) < TOKEN_REFRESH_INTERVAL_MS) {
    return cachedToken;
  }

  // B — Build auth URL at call time (after dotenv has loaded)
  const AUTH_URL = `${process.env.EVALUATION_BASE_URL}/auth`;

  // C — Request a fresh token
  try {
    console.log(`[AUTH] Requesting fresh auth token from ${AUTH_URL}...`);

    const response = await axios.post(AUTH_URL, {
      email: process.env.AUTH_EMAIL,
      name: process.env.AUTH_NAME,
      rollNo: process.env.AUTH_ROLLNO,
      accessCode: process.env.AUTH_ACCESSCODE,
      clientID: process.env.AUTH_CLIENTID,
      clientSecret: process.env.AUTH_CLIENTSECRET,
    });

    cachedToken = response.data.access_token;
    tokenFetchedAt = Date.now();

    console.log("[AUTH] Token refreshed successfully");
    return cachedToken;
  } catch (err) {
    console.error(`[AUTH] Failed to fetch token: ${err.message}`);
    return null;
  }
}

export default { getAuthToken };
