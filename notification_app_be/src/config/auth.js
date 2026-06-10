import axios from "axios";
import { Log } from "../../../logging_middleware/index.js";

let cachedToken = null;
let tokenFetchedAt = 0;
const TOKEN_REFRESH_MS = 10 * 60 * 1000; // refresh every 10 min

export async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && (now - tokenFetchedAt) < TOKEN_REFRESH_MS) {
    return cachedToken;
  }

  const AUTH_URL = `${process.env.EVALUATION_BASE_URL}/auth`;

  try {
    Log("backend", "info", "auth", `Requesting token from ${AUTH_URL}`);

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
    Log("backend", "info", "auth", "Token refreshed");
    return cachedToken;
  } catch (err) {
    Log("backend", "error", "auth", `Token fetch failed: ${err.message}`);
    return null;
  }
}

export default { getAuthToken };
