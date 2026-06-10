// standalone script to fetch notifications and find top 10 by priority
// run: node src/priority_inbox.js

import axios from "axios";
import { Log, initLogger, setToken } from "../../logging_middleware/index.js";

const BASE_URL = "http://4.224.186.213/evaluation-service";
const AUTH_CREDENTIALS = {
  email: "arjunv12214@gmail.com",
  name: "arjun v",
  rollNo: "e0223017",
  accessCode: "DvwEDZ",
  clientID: "702caf50-0a6e-43e4-84f1-47fc017723cd",
  clientSecret: "ccEVesyrugPVUwMG",
};

const TYPE_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

// score = (weight * 10^13) + timestamp_ms
function calculatePriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + timestamp;
}

// minheap to efficiently keep only top N items
class MinHeap {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.heap = [];
  }

  insert(entry) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(entry);
      this._bubbleUp(this.heap.length - 1);
    } else if (entry.score > this.heap[0].score) {
      this.heap[0] = entry;
      this._sinkDown(0);
    }
  }

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
      if (left < length && this.heap[left].score < this.heap[smallest].score) smallest = left;
      if (right < length && this.heap[right].score < this.heap[smallest].score) smallest = right;
      if (smallest !== idx) {
        [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
        idx = smallest;
      } else break;
    }
  }
}

async function main() {
  const TOP_N = 10;

  initLogger(AUTH_CREDENTIALS);
  Log("backend", "info", "service", "Priority Inbox script started");

  // get auth token
  let token;
  try {
    const authResponse = await axios.post(`${BASE_URL}/auth`, AUTH_CREDENTIALS);
    token = authResponse.data.access_token;
    setToken(token);
    Log("backend", "info", "auth", "Got token");
  } catch (err) {
    Log("backend", "fatal", "auth", `Auth failed: ${err.message}`);
    process.exit(1);
  }

  // fetch notifications
  let notifications;
  try {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
    notifications = response.data.notifications || [];
    Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);
  } catch (err) {
    Log("backend", "fatal", "service", `Fetch failed: ${err.message}`);
    process.exit(1);
  }

  if (notifications.length === 0) {
    Log("backend", "warn", "service", "No notifications found");
    process.exit(0);
  }

  // build priority inbox using minheap
  const inbox = new MinHeap(TOP_N);
  for (const notification of notifications) {
    const score = calculatePriorityScore(notification);
    inbox.insert({ ...notification, score, typeWeight: TYPE_WEIGHTS[notification.Type] || 0 });
  }

  const topNotifications = inbox.getSorted();

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

  process.stdout.write(JSON.stringify(output, null, 2) + "\n");

  for (const item of output.results) {
    Log("backend", "info", "service", `#${item.rank} [${item.type}] "${item.message}" (Score: ${item.priorityScore})`);
  }

  Log("backend", "info", "service", "Done");
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

main();
