import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Game state
const rooms = new Map();
const prompts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "The best way to predict the future is to implement it. Write code that makes a difference.",
  "Simplicity is the ultimate sophistication. Clean code is not just about aesthetics.",
  "The only way to learn a new programming language is by writing programs in it.",
  "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "The most damaging phrase in the language is 'We've always done it this way.'",
  "Code never lies, comments sometimes do. Write self-documenting code.",
  "The best error message is the one that never shows up. Write robust code.",
];

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    handleDisconnect(ws);
  });
});

function handleMessage(ws, data) {
  switch (data.type) {
    case "create_room":
      createRoom(ws);
      break;
    case "join_room":
      joinRoom(ws, data.roomId);
      break;
    case "typing_progress":
      updateTypingProgress(ws, data);
      break;
    case "player_ready":
      playerReady(ws, data.roomId);
      break;
    case "game_complete":
      handleGameComplete(ws, data);
      break;
    default:
      console.log("Unknown message type:", data.type);
  }
}

function createRoom(ws) {
  const roomId = uuidv4().substring(0, 8);
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const room = {
    id: roomId,
    prompt: prompt,
    players: [
      {
        id: uuidv4(),
        ws: ws,
        name: `Player 1`,
        progress: 0,
        wpm: 0,
        ready: false,
      },
    ],
    gameState: "waiting", // waiting, starting, active, finished
    startTime: null,
    endTime: null,
  };

  rooms.set(roomId, room);
  ws.roomId = roomId;
  ws.playerId = room.players[0].id;

  ws.send(
    JSON.stringify({
      type: "room_created",
      roomId: roomId,
      prompt: prompt,
      playerId: room.players[0].id,
      playerName: room.players[0].name,
    })
  );

  console.log(`Room created: ${roomId}`);
}

function joinRoom(ws, roomId) {
  const room = rooms.get(roomId);

  if (!room) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Room not found",
      })
    );
    return;
  }

  if (room.players.length >= 2) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Room is full",
      })
    );
    return;
  }

  const playerId = uuidv4();
  const player = {
    id: playerId,
    ws: ws,
    name: `Player 2`,
    progress: 0,
    wpm: 0,
    ready: false,
  };

  room.players.push(player);
  ws.roomId = roomId;
  ws.playerId = playerId;

  // Notify both players
  room.players.forEach((p) => {
    p.ws.send(
      JSON.stringify({
        type: "player_joined",
        roomId: roomId,
        prompt: room.prompt,
        playerId: playerId,
        playerName: player.name,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          ready: p.ready,
        })),
      })
    );
  });

  console.log(`Player joined room: ${roomId}`);
}

function playerReady(ws, roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.find((p) => p.id === ws.playerId);
  if (player) {
    player.ready = true;

    // Check if both players are ready
    const allReady = room.players.every((p) => p.ready);

    if (allReady && room.players.length === 2) {
      room.gameState = "starting";

      // Start countdown
      room.players.forEach((p) => {
        p.ws.send(
          JSON.stringify({
            type: "game_starting",
            countdown: 3,
          })
        );
      });

      // Start game after 3 seconds
      setTimeout(() => {
        if (room.gameState === "starting") {
          room.gameState = "active";
          room.startTime = Date.now();

          room.players.forEach((p) => {
            p.ws.send(
              JSON.stringify({
                type: "game_started",
                startTime: room.startTime,
              })
            );
          });

          // End game after 30 seconds
          setTimeout(() => {
            if (room.gameState === "active") {
              endGame(room);
            }
          }, 30000);
        }
      }, 3000);
    } else {
      // Notify other players about ready status
      room.players.forEach((p) => {
        p.ws.send(
          JSON.stringify({
            type: "player_ready_update",
            players: room.players.map((p) => ({
              id: p.id,
              name: p.name,
              ready: p.ready,
            })),
          })
        );
      });
    }
  }
}

function updateTypingProgress(ws, data) {
  const room = rooms.get(ws.roomId);
  if (!room || room.gameState !== "active") return;

  const player = room.players.find((p) => p.id === ws.playerId);
  if (player) {
    player.progress = data.progress;
    player.wpm = data.wpm;

    // Send progress to other player
    room.players.forEach((p) => {
      if (p.id !== ws.playerId) {
        p.ws.send(
          JSON.stringify({
            type: "opponent_progress",
            playerId: ws.playerId,
            progress: data.progress,
            wpm: data.wpm,
          })
        );
      }
    });
  }
}

function handleGameComplete(ws, data) {
  const room = rooms.get(ws.roomId);
  if (!room) return;

  const player = room.players.find((p) => p.id === ws.playerId);
  if (player) {
    player.wpm = data.wpm;
    player.progress = data.progress;
  }

  // Check if both players have completed
  const allCompleted = room.players.every((p) => p.wpm > 0);

  if (allCompleted) {
    endGame(room);
  }
}

function endGame(room) {
  room.gameState = "finished";
  room.endTime = Date.now();

  const results = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    wpm: p.wpm,
    progress: p.progress,
  }));

  room.players.forEach((p) => {
    p.ws.send(
      JSON.stringify({
        type: "game_finished",
        results: results,
        duration: room.endTime - room.startTime,
      })
    );
  });

  console.log(`Game finished in room: ${room.id}`);
}

function handleDisconnect(ws) {
  if (ws.roomId) {
    const room = rooms.get(ws.roomId);
    if (room) {
      // Remove player from room
      room.players = room.players.filter((p) => p.ws !== ws);

      // Notify remaining players
      room.players.forEach((p) => {
        p.ws.send(
          JSON.stringify({
            type: "player_disconnected",
            message: "Opponent disconnected",
          })
        );
      });

      // Clean up empty rooms
      if (room.players.length === 0) {
        rooms.delete(ws.roomId);
        console.log(`Room deleted: ${ws.roomId}`);
      }
    }
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
