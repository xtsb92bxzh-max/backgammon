# Backgammon Club

A responsive backgammon opening trainer built with React and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. For a production build:

```sh
npm run build
```

Deploy the generated `dist` directory to any static hosting provider.

## Features

- Interactive board with legal destination highlighting and undo
- Three guided opening exercises with explanations and hints
- Random opening rolls, including four moves for doubles
- Lessons covering openings, point building, and hitting
- Browser-local progress, days practiced, and reviewed-move accuracy
- Optional move sounds and responsive layouts

The trainer focuses on opening positions, not full games against an opponent. Free practice uses a simple point-building heuristic, not engine equity analysis. Progress is stored in localStorage on the current browser.

## Rule checks

```sh
npm test
```

Tests cover starting position, recommended openings, blocking, hits, bar entry, bearing off, doubles, and mandatory higher-die use.
