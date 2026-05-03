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
