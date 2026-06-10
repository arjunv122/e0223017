// ============================================================
// STAGE 6 — Priority Inbox: Top N Notification Finder
// Campus Notification Platform
//
// This standalone script fetches notifications from the
// evaluation service API and computes the top N priority
// notifications based on:
//   - Type Weight: Placement(3) > Result(2) > Event(1)
//   - Recency: More recent timestamps rank higher
//
// Usage: node priority_inbox.js
// ============================================================

import axios from "axios";
import { Log, initLogger, setToken } from "../../logging_middleware/index.js";

// ── Configuration ─────────────────────────────────────────────
const BASE_URL = "http://4.224.186.213/evaluation-service";
const AUTH_CREDENTIALS = {
  email: "arjunv12214@gmail.com",
  name: "arjun v",
  rollNo: "e0223017",
  accessCode: "DvwEDZ",
  clientID: "702caf50-0a6e-43e4-84f1-47fc017723cd",
  clientSecret: "ccEVesyrugPVUwMG",
};

// ── Type Weight Map ───────────────────────────────────────────
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ── Priority Score Calculation ────────────────────────────────
/**
 * Calculate a composite priority score for a notification.
 *
 * Formula: (type_weight × 10^13) + unix_timestamp_ms
 *
 * This ensures:
 *   - All Placements rank above all Results
 *   - All Results rank above all Events
 *   - Within the same type, newer notifications rank higher
 *
 * @param {Object} notification - { ID, Type, Message, Timestamp }
 * @returns {number} The computed priority score
 */
function calculatePriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + timestamp;
}

// ── MinHeap Implementation ────────────────────────────────────
/**
 * MinHeap-based Priority Inbox for efficient top-N maintenance.
 *
 * Why MinHeap?
 *   - We maintain a heap of size N (the "top N")
 *   - The root of the MinHeap is always the LOWEST priority item in our top-N
 *   - When a new notification arrives with score > root, we replace root and heapify
 *   - This gives O(log N) insertion, optimal for streaming scenarios
 *
 * Time Complexity:
 *   - Insert: O(log N)
 *   - Get all sorted: O(N log N)
 *   - Space: O(N)
 */
class MinHeap {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.heap = [];
  }

  /**
   * Insert a notification entry into the priority inbox.
   * If inbox is full and new score > minimum, replace the minimum.
   */
  insert(entry) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(entry);
      this._bubbleUp(this.heap.length - 1);
    } else if (entry.score > this.heap[0].score) {
      this.heap[0] = entry;
      this._sinkDown(0);
    }
  }

  /**
   * Get all entries sorted by priority score (highest first).
   */
  getSorted() {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent].score > this.heap[idx].score) {
        [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
        idx = parent;
      } else break;
    }
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < length && this.heap[left].score < this.heap[smallest].score)
        smallest = left;
      if (right < length && this.heap[right].score < this.heap[smallest].score)
        smallest = right;
      if (smallest !== idx) {
        [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
        idx = smallest;
      } else break;
    }
  }
}

// ── Main Execution ────────────────────────────────────────────
async function main() {
  const TOP_N = 10;

  // A — Initialize the logging middleware
  initLogger(AUTH_CREDENTIALS);
  Log("backend", "info", "service", "Priority Inbox script started");

  // B — Authenticate to get Bearer token
  Log("backend", "info", "auth", "Requesting auth token...");
  let token;
  try {
    const authResponse = await axios.post(`${BASE_URL}/auth`, AUTH_CREDENTIALS);
    token = authResponse.data.access_token;
    setToken(token);
    Log("backend", "info", "auth", "Auth token acquired successfully");
  } catch (err) {
    Log("backend", "fatal", "auth", `Failed to authenticate: ${err.message}`);
    process.exit(1);
  }

  // C — Fetch all notifications from the evaluation API
  Log("backend", "info", "service", "Fetching notifications from evaluation service...");
  let notifications;
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    notifications = response.data.notifications || [];
    Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);
  } catch (err) {
    Log("backend", "fatal", "service", `Failed to fetch notifications: ${err.message}`);
    process.exit(1);
  }

  if (notifications.length === 0) {
    Log("backend", "warn", "service", "No notifications available");
    process.exit(0);
  }

  // D — Build the Priority Inbox using MinHeap
  Log("backend", "info", "service", `Building Priority Inbox (Top ${TOP_N})...`);
  const inbox = new MinHeap(TOP_N);

  for (const notification of notifications) {
    const score = calculatePriorityScore(notification);
    inbox.insert({
      ...notification,
      score,
      typeWeight: TYPE_WEIGHTS[notification.Type] || 0,
    });
  }

  // E — Get the sorted results
  const topNotifications = inbox.getSorted();

  // F — Display the output
  Log("backend", "info", "service", `\n========== TOP ${TOP_N} PRIORITY NOTIFICATIONS ==========`);

  const output = {
    totalFetched: notifications.length,
    topN: TOP_N,
    priorityWeights: { Placement: 3, Result: 2, Event: 1 },
    formula: "(type_weight × 10^13) + unix_timestamp_ms",
    results: topNotifications.map((n, idx) => ({
      rank: idx + 1,
      id: n.ID,
      type: n.Type,
      typeWeight: n.typeWeight,
      message: n.Message,
      timestamp: n.Timestamp,
      priorityScore: n.score,
    })),
  };

  // Print formatted output
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");

  // Log each notification for remote tracking
  for (const item of output.results) {
    Log(
      "backend",
      "info",
      "service",
      `#${item.rank} [${item.type}] "${item.message}" (Score: ${item.priorityScore})`
    );
  }

  Log("backend", "info", "service", "Priority Inbox computation complete");

  // G — Wait briefly for async log calls to complete before exiting
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

main();
