# Gmail Job Tracker UI

A simple Kanban-style web application for tracking job applications using your Gmail account. Built with React and TypeScript, powered by Vite.

## Features

- Kanban board for managing job applications
- Add, edit, and view application details
- Email integration (planned)
- Application statistics bar

## Project Structure

- `src/` — Main source code
  - `components/` — React components (KanbanBoard, ApplicationCard, AddModal, EmailModal, StatsBar)
  - `api.ts` — API integration logic
  - `types.ts` — TypeScript types
  - `App.tsx` — Main app component
  - `main.tsx` — Entry point
- `public/` — Static assets
- `index.html` — Main HTML file

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

### Building for Production

```bash
npm run build
```

## Live Demo

👉 [https://vr33ni-dev.github.io/gmail-job-tracker](https://vr33ni-dev.github.io/gmail-job-tracker)

The demo uses sample data — [set up the full version](#setup) to track your own applications.

## License

MIT

## TODO

### GitHub Pages demo auto-deploy from React frontend

Currently the GitHub Pages demo (`docs/index.html`) is a standalone HTML file that must be manually updated when the frontend changes.

Planned improvement:

- Build the React frontend with `VITE_DEMO_MODE=true` in CI
- Swap API calls for mock data when demo mode is enabled (`src/mockData.ts` + `src/api.ts`)
- GitHub Actions workflow builds and deploys `jobtracker-frontend/dist/` to Pages automatically on every push to `master`
