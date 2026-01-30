# LittleLogic

LittleLogic is a simple chat style web app that will explain anything to you like a 5 year old.

Access [LittleLogic](https://little-logic.pages.dev)

## 📸 Preview

<img width="1088" height="692" alt="image" src="https://github.com/user-attachments/assets/d2b70648-c16d-4f32-b9d0-a16d91ce25f6" />

## Features

This project uses a BHVR style stack:
Bun for runtime
Hono for the backend API
Vite + React for the frontend UI

## Setup

### Installation

```bash
# Install dependencies for all workspaces
bun install
```

### Development

```bash
# Run all workspaces in development mode with Turbo
bun run dev

# Or run individual workspaces directly
bun run dev:client    # Run the Vite dev server for React
bun run dev:server    # Run the Hono backend
```

### Building

```bash
# Build all workspaces with Turbo
bun run build

# Or build individual workspaces directly
bun run build:client  # Build the React frontend
bun run build:server  # Build the Hono backend
```

### Additional Commands

```bash
# Lint all workspaces
bun run lint

# Type check all workspaces
bun run type-check

# Run tests across all workspaces
bun run test
```
