// ============================================================
// PRIORITY SERVICE — Priority Inbox Algorithm (Stage 6)
// Uses a scoring system: Weight (type) + Recency (timestamp)
// Placement(3) > Result(2) > Event(1), newer = higher priority
// ============================================================

import { backend as log } from "../../../logging_middleware/index.js";

// ── Type Weight Map ───────────────────────────────────────────
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Calculate a priority score for a notification.
 * Formula: (type_weight * 10^13) + unix_timestamp_ms
 * This ensures all Placements rank above all Results, etc.
 * Within the same type, more recent notifications rank higher.
 *
 * @param {Object} notification - A notification object with Type and Timestamp
 * @returns {number} The computed priority score
 */
export function calculatePriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + timestamp;
}

/**
 * Get the top N priority notifications from an array.
 * Uses a simple sort-and-slice approach (optimal for small N and
 * moderate dataset sizes typical in this assessment).
 *
 * @param {Array} notifications - Array of notification objects
 * @param {number} n - Number of top notifications to return (default 10)
 * @returns {Array} Top N notifications sorted by priority (highest first)
 */
export function getTopNPriority(notifications, n = 10) {
  log.info("service", `Computing top ${n} priority notifications from ${notifications.length} total`);

  if (!Array.isArray(notifications) || notifications.length === 0) {
    log.warn("service", "No notifications provided for priority computation");
    return [];
  }

  // A — Calculate scores and attach to each notification
  const scored = notifications.map((notification) => ({
    ...notification,
    _priorityScore: calculatePriorityScore(notification),
    _typeWeight: TYPE_WEIGHTS[notification.Type] || 0,
  }));

  // B — Sort by priority score descending (highest first)
  scored.sort((a, b) => b._priorityScore - a._priorityScore);

  // C — Slice top N and clean up internal fields
  const topN = scored.slice(0, n).map((item) => {
    const { _priorityScore, _typeWeight, ...clean } = item;
    return {
      ...clean,
      priorityScore: _priorityScore,
      typeWeight: _typeWeight,
    };
  });

  log.info("service", `Computed top ${topN.length} priority notifications`);
  return topN;
}

/**
 * MinHeap-based approach for maintaining top N as new notifications
 * stream in. Efficient for real-time scenarios.
 * Time complexity: O(log N) per insertion.
 */
export class PriorityInbox {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.heap = []; // min-heap based on priority score
  }

  /**
   * Insert a notification into the priority inbox.
   * If the inbox is full and the new notification has higher priority
   * than the minimum, replace the minimum.
   */
  insert(notification) {
    const score = calculatePriorityScore(notification);
    const entry = { ...notification, _score: score };

    if (this.heap.length < this.maxSize) {
      this.heap.push(entry);
      this._bubbleUp(this.heap.length - 1);
    } else if (score > this.heap[0]._score) {
      this.heap[0] = entry;
      this._sinkDown(0);
    }
  }

  /**
   * Get all notifications in the inbox sorted by priority (highest first).
   */
  getAll() {
    return [...this.heap]
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...rest }) => ({ ...rest, priorityScore: _score }));
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent]._score > this.heap[idx]._score) {
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
      if (left < length && this.heap[left]._score < this.heap[smallest]._score) smallest = left;
      if (right < length && this.heap[right]._score < this.heap[smallest]._score) smallest = right;
      if (smallest !== idx) {
        [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
        idx = smallest;
      } else break;
    }
  }
}

export default { calculatePriorityScore, getTopNPriority, PriorityInbox };
