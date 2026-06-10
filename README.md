# Campus Notification Platform — Full Stack Assessment

A full stack notification platform where students receive real-time updates regarding **Placements**, **Events**, and **Results**. Features a Priority Inbox that ranks notifications by type weight and recency.

## Repository Structure

```
├── logging_middleware/        # Centralized remote logging middleware
│   ├── index.js               # Log(), requestLogger(), backend/frontend shortcuts
│   └── package.json
│
├── notification_system_design.md   # System design document (Stages 1-6)
│
├── notification_app_be/       # Backend API (Express.js, ESM)
│   ├── .env                   # Environment variables (not committed)
│   ├── .env.example           # Template for env variables
│   ├── package.json
│   └── src/
│       ├── server.js          # Entry point
│       ├── config/
│       │   └── auth.js        # Token management
│       ├── controllers/
│       │   └── notification.controller.js
│       ├── routes/
│       │   └── notification.routes.js
│       ├── services/
│       │   ├── notification.service.js   # Fetches from evaluation API
│       │   └── priority.service.js       # Priority scoring + MinHeap
│       └── priority_inbox.js  # Standalone Stage 6 script
│
├── notification_app_fe/       # Frontend (React + Vite + MUI)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx           # Entry with MUI dark theme
│       ├── App.jsx            # Router setup
│       ├── api/               # Axios client + API functions
│       ├── components/        # Navbar, NotificationCard, FilterBar
│       └── pages/             # AllNotifications, PriorityInbox
│
└── .gitignore
```

## Setup & Run

### Backend
```bash
cd notification_app_be
cp .env.example .env   # Fill in your credentials
npm install
npm run dev            # Runs on http://localhost:5000
```

### Frontend
```bash
cd notification_app_fe
npm install
npm run dev            # Runs on http://localhost:3000
```

### Stage 6 — Priority Inbox Script
```bash
cd notification_app_be
node src/priority_inbox.js
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List all notifications (supports `page`, `limit`, `notification_type` query params) |
| GET | `/api/notifications/priority` | Get top N priority notifications (supports `n`, `notification_type` query params) |

## Priority Algorithm

Priority is computed using:
```
priority_score = (type_weight × 10^13) + unix_timestamp_ms
```

| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

This ensures all Placements always rank above all Results, and within the same type, more recent notifications rank higher. The MinHeap data structure maintains the top N efficiently in O(log N) per insertion.

## Tech Stack

- **Backend**: Node.js, Express.js, Axios, ESM modules
- **Frontend**: React, Vite, Material UI, React Router
- **Logging**: Custom remote logging middleware (evaluation service integration)
