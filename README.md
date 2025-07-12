# Two-Player Monkeytype Clone

A real-time two-player typing game inspired by Monkeytype, built with React, Tailwind CSS, and Node.js with WebSocket support.

## Features

### 🎮 Core Gameplay

- **Real-time two-player typing competition** - Challenge your friend to a typing duel
- **30-second timed sessions** - Fast-paced, intense typing challenges
- **WPM (Words Per Minute) calculation** - Accurate speed measurement
- **Real-time progress tracking** - See your opponent's progress as you type
- **Character-by-character validation** - Visual feedback for correct/incorrect typing

### 🌐 Multiplayer Features

- **Room-based matchmaking** - Create or join rooms with unique codes
- **WebSocket real-time communication** - Instant updates between players
- **Player ready system** - Both players must be ready to start
- **3-second countdown** - Synchronized game start
- **Automatic game completion** - Results calculated when time expires

### 🎨 User Interface

- **Clean, minimal design** - Distraction-free typing experience
- **Responsive layout** - Works on desktop and mobile devices
- **Real-time progress bars** - Visual representation of typing progress
- **Color-coded feedback** - Green for correct, red for errors, blue for current position
- **Elegant results screen** - Winner announcement with detailed statistics

## Tech Stack

### Frontend

- **React 19** - Modern React with hooks and functional components
- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **Vite** - Fast build tool and development server

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **ws** - WebSocket library for real-time communication
- **UUID** - Unique identifier generation for rooms and players

## Project Structure

```
monkey/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Lobby.jsx     # Room creation/joining interface
│   │   │   ├── GameRoom.jsx  # Main game interface
│   │   │   ├── TypingArea.jsx # Typing input and validation
│   │   │   └── Results.jsx   # Game results display
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── server.js            # Main server with WebSocket handling
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd monkey
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The server will start on `http://localhost:3001`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to start playing

## How to Play

### Creating a Game

1. Open the application in your browser
2. Click "Create New Room"
3. Share the room code with your friend
4. Click "I'm Ready" when you're prepared to start

### Joining a Game

1. Open the application in your browser
2. Click "Join Existing Room"
3. Enter the room code provided by your friend
4. Click "Join Room"
5. Click "I'm Ready" when you're prepared to start

### Gameplay

1. Both players must click "Ready" to start the countdown
2. After the 3-second countdown, the 30-second timer begins
3. Type the displayed text as quickly and accurately as possible
4. Watch your opponent's progress in real-time
5. When the timer ends, results are displayed with WPM scores

## Game Rules

- **Timer**: 30 seconds per game
- **Scoring**: WPM (Words Per Minute) based on correctly typed words
- **Progress**: Calculated as percentage of text completed
- **Validation**: Character-by-character checking with visual feedback
- **Winner**: Player with the highest WPM score

## Development

### Backend API Endpoints

- `GET /health` - Health check endpoint
- WebSocket connection for real-time game communication

### WebSocket Message Types

- `create_room` - Create a new game room
- `join_room` - Join an existing room
- `player_ready` - Mark player as ready
- `typing_progress` - Send typing progress updates
- `game_complete` - Send final game results

### Frontend Components

- **Lobby**: Room creation and joining interface
- **GameRoom**: Main game interface with timer and progress
- **TypingArea**: Text input with real-time validation
- **Results**: Game results display with statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Monkeytype](https://monkeytype.com/)
- Built with modern web technologies for optimal performance
- Designed for a smooth, distraction-free typing experience
