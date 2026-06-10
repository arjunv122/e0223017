import { backend as log } from "../../../logging_middleware/index.js";

// weights: placement is most important, then result, then event
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// score = (weight * 10^13) + timestamp_ms
// this makes sure all placements rank above all results etc.
export function calculatePriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + timestamp;
}

// simple sort + slice for getting top N — works fine for our dataset size
export function getTopNPriority(notifications, n = 10) {
  log.info("service", `Computing top ${n} from ${notifications.length} notifications`);

  if (!Array.isArray(notifications) || notifications.length === 0) {
    log.warn("service", "Empty notifications array");
    return [];
  }

  const scored = notifications.map((notification) => ({
    ...notification,
    _priorityScore: calculatePriorityScore(notification),
    _typeWeight: TYPE_WEIGHTS[notification.Type] || 0,
  }));

  scored.sort((a, b) => b._priorityScore - a._priorityScore);

  const topN = scored.slice(0, n).map((item) => {
    const { _priorityScore, _typeWeight, ...clean } = item;
    return {
      ...clean,
      priorityScore: _priorityScore,
      typeWeight: _typeWeight,
    };
  });

  log.info("service", `Returning top ${topN.length} priority notifications`);
  return topN;
}

// minheap based approach for streaming/real-time use case
// keeps only the top N at all times, O(log N) per insert
export class PriorityInbox {
  constructor(maxSize = 10) {
    this.maxSize = maxSize;
    this.heap = [];
  }

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
