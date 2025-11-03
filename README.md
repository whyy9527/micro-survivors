# Micro Survivors 🎮

A roguelike survivor game built with React + TypeScript, inspired by Vampire Survivors-style games.

## Features

- 🎯 Auto-attacking survivor gameplay
- 🎨 Beautiful Canvas rendering effects
- 📱 Mobile-friendly touch controls
- ⚔️ Multiple weapons and skill system
- 🎯 Talent and upgrade system
- 💾 Local save functionality

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Game Engine**: Custom Canvas rendering engine
- **State Management**: React Hooks
- **Package Manager**: pnpm

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
```

Visit <http://localhost:3000> to play the game.

### Build Production Version

```bash
pnpm build
```

### Preview Build

```bash
pnpm preview
```

## Gameplay

1. **Movement**: Use WASD or arrow keys to move your character
2. **Auto-Attack**: Your character automatically attacks nearby enemies
3. **Leveling Up**: Defeat enemies to gain experience, choose new weapons or skills when leveling up
4. **Survival**: Survive as long as possible and defeat more enemies

## Project Structure

```
src/
├── game/              # Game core code
│   ├── entities/      # Game entities
│   ├── systems/       # Game systems
│   ├── ui/           # UI components
│   ├── utils/        # Utility functions
│   ├── Game.tsx      # Main game component
│   ├── GameEngine.ts # Game engine
│   └── GameRenderer.ts# Renderer
├── App.tsx           # Root component
└── main.tsx          # Application entry point
```

## Development Notes

- Game uses Canvas for high-performance rendering
- Component-based architecture for easy extension and maintenance
- Mobile touch controls support
- Complete game state management

## License

MIT License
