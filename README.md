# ZenPomodoro

A beautifully minimalist Pomodoro timer with animated progress ring, session tracking, and productivity statistics

Built with [Builddy](https://builddy.dev) — AI-powered app builder using GLM 5.1.

## Features

- Animated circular progress ring with smooth countdown
- Focus (25m), Short Break (5m), Long Break (15m) modes with distinct accent colors
- Session counter tracking completed pomodoros with auto long break after 4
- Keyboard shortcuts (Space to start/pause, R to reset)
- Web Audio API notification chime on timer completion
- Session history with daily productivity statistics
- CSV export for session data
- Smooth 300ms color transitions between modes
- Zen minimalist dark theme with breathing room

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Docker

```bash
docker compose up
```

### Deploy to Railway/Render

1. Push this directory to a GitHub repo
2. Connect to Railway or Render
3. It auto-detects the Dockerfile
4. Done!

## Tech Stack

- **Frontend**: HTML/CSS/JS + Tailwind CSS
- **Backend**: Express.js
- **Database**: SQLite
- **Deployment**: Docker