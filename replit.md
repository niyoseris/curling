# Curling Game

## Overview

This is a mobile curling game built with Expo/React Native that runs on iOS, Android, and web. The player competes against an AI opponent in a 4-end curling match, throwing stones toward the house (target) on an ice sheet. The game features physics-based stone movement, collision detection, AI opponents, haptic feedback, and score tracking across multiple ends.

The project follows a full-stack architecture with an Express backend server and an Expo React Native frontend, though the game logic is primarily client-side. The backend currently serves as a landing page and API scaffold with user management stubs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)
- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture
- **Routing**: expo-router with file-based routing (`app/` directory). Single main screen at `app/index.tsx`
- **State Management**: React Context (`contexts/GameContext.tsx`) manages all game state including phase transitions, stone positions, scores, and turn management. No external state library beyond React Query for server data
- **Game Phases**: Menu → Playing → Throwing → AI Thinking → AI Throwing → End Summary → Game Over, managed through a `GamePhase` type
- **Physics Engine**: Custom 2D physics in `lib/physics.ts` handling friction, collisions (with restitution), stone movement, and boundary detection. Uses `requestAnimationFrame` for animation loop
- **AI System**: `lib/ai.ts` implements opponent logic that decides between draw shots (placing stones near center) and takeout shots (hitting opponent stones) based on game state
- **UI Components**: SVG-based curling sheet rendering (`react-native-svg`), power meter with pan gestures, scoreboard, end summaries, and game over screen
- **Fonts**: Inter font family loaded via `@expo-google-fonts/inter`
- **Haptics**: `expo-haptics` for tactile feedback on throws and UI interactions
- **Error Handling**: Class-based ErrorBoundary component wrapping the app

### Backend (Express)
- **Server**: Express 5 running on port 5000, serves static files in production and proxies to Expo Metro bundler in development
- **API Structure**: Routes registered in `server/routes.ts`, prefixed with `/api`. Currently minimal - just the HTTP server scaffold
- **Storage**: `server/storage.ts` defines an `IStorage` interface with in-memory implementation (`MemStorage`) for user CRUD operations. Not actively used by the game
- **CORS**: Dynamic CORS configuration supporting Replit domains and localhost for development
- **Build**: Production build uses `esbuild` to bundle server code, and a custom `scripts/build.js` for Expo static web builds

### Database Schema
- **ORM**: Drizzle ORM configured for PostgreSQL (`drizzle.config.ts`)
- **Schema**: Single `users` table in `shared/schema.ts` with `id` (UUID), `username`, and `password` fields
- **Validation**: Zod schemas generated from Drizzle schema via `drizzle-zod`
- **Note**: The database is defined but not actively connected or used by the game. The storage layer currently uses in-memory maps. A PostgreSQL database will need to be provisioned and `DATABASE_URL` environment variable set if database features are added

### Key Design Decisions
- **Client-side game logic**: All physics, AI, and game state run on the client. This eliminates latency for a single-player game but means no server-side validation
- **Custom physics over game engine**: A lightweight custom physics system was chosen over a full game engine, keeping the bundle small and avoiding native module complexity
- **Context over Redux**: React Context is sufficient for single-screen game state without the overhead of Redux
- **SVG rendering**: Game visuals use `react-native-svg` rather than a canvas/WebGL approach, ensuring cross-platform compatibility with Expo's managed workflow

### Path Aliases
- `@/*` maps to project root
- `@shared/*` maps to `./shared/*`

## External Dependencies

- **PostgreSQL**: Configured via Drizzle ORM but requires `DATABASE_URL` environment variable. Not currently active in game functionality
- **Expo Services**: Uses various Expo SDK modules (haptics, crypto, fonts, linear-gradient, blur, image)
- **React Query (`@tanstack/react-query`)**: Set up for server state management with `lib/query-client.ts` providing API request helpers. The query client points to the Express backend using `EXPO_PUBLIC_DOMAIN`
- **Key Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string (for Drizzle)
  - `REPLIT_DEV_DOMAIN` - Used for Expo dev server proxy and CORS
  - `EXPO_PUBLIC_DOMAIN` - Frontend API base URL configuration