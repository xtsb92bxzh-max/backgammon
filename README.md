# Backgammon Club

A responsive backgammon beginner and opening trainer built with React and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. For a production build:

```sh
npm run build
```

Deploy the generated `dist` directory to any static hosting provider.

## Project layout

`index.html`, `package.json`, and `package-lock.json` live at the repository root.
The React entry point, styles, rules engine, and rule tests live in `src/`.
Keep that folder structure when uploading or copying the project.

GitHub Actions runs the rule tests and production build for pull requests and
updates to `main`. Generated `dist/` files and `node_modules/` are ignored by Git.

## Features

- Interactive board with legal destination highlighting and undo
- Nine beginner lessons, starting with the board and goal, with short questions and practical rule exercises
- A lesson selector in Learn and Progress to choose your starting point or resume manually
- Three guided opening exercises with explanations and hints
- Random opening rolls, including four moves for doubles
- Lessons covering openings, point building, and hitting
- Browser-local progress, days practiced, and reviewed-move accuracy
- Optional move sounds and responsive layouts

The app opens in Learn at your saved beginner lesson. Lessons cover the board, movement, dice, closed points, hits, bar entry, doubles, bearing off, and the first opening. Small practice boards introduce one rule at a time; they are labelled as simplified positions.

Your chosen lesson and completed lessons are saved in localStorage for this browser and site. There is no account or cross-device sync. On another browser or device, or after clearing browser data, use **Choose your lesson** in Learn or **I'm up to this lesson** in Progress to set your checkpoint. Choosing a lesson does not mark earlier lessons complete. Existing opening progress is retained. If browser storage is unavailable, learning still works and the app explains that progress cannot be saved.

The trainer teaches rules and opening positions, not full games against an opponent. Free practice uses a simple point-building heuristic, not engine equity analysis. Rules reference: [U.S. Backgammon Federation basics](https://usbgf.org/backgammon-basics-how-to-play/).

## Rule checks

```sh
npm test
```

Tests cover starting position, recommended openings, blocking, hits, bar entry, bearing off, doubles, mandatory higher-die use, beginner exercise legality, progress migration, checkpoint selection, and storage failure handling.
