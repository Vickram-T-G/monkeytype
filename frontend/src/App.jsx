import { useState, useEffect, useRef } from "react";
import Lobby from "./components/Lobby";
import GameRoom from "./components/GameRoom";
import Results from "./components/Results";
import "./App.css";

function App() {
  const [gameState, setGameState] = useState("lobby"); // lobby, room, results
  const [roomId, setRoomId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [opponentWpm, setOpponentWpm] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Get WebSocket URL from environment or use localhost for development
  const getWebSocketUrl = () => {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    // For GitHub Pages, you'll need to update this to your backend URL
    return "ws://localhost:3001";
  };

  const connectWebSocket = () => {
    // Don't create multiple connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWebSocketUrl());

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError("");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);

        // Only attempt reconnection if not a normal closure
        if (event.code !== 1000) {
          console.log("Attempting to reconnect in 3 seconds...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setError("Connection failed. Please check if the server is running.");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setError("Failed to connect to server. Please try again.");
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Normal closure");
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "room_created":
        setRoomId(data.roomId);
        setPlayerId(data.playerId);
        setPlayerName(data.playerName);
        setPrompt(data.prompt);
        setGameState("room");
        setError("");
        break;

      case "player_joined":
        setRoomId(data.roomId);
        setPlayerId(data.playerId);
        setPlayerName(data.playerName);
        setPrompt(data.prompt);
        setPlayers(data.players);
        setGameState("room");
        setError("");
        break;

      case "player_ready_update":
        setPlayers(data.players);
        break;

      case "game_starting":
        // Handle countdown
        break;

      case "game_started":
        // Game is now active
        break;

      case "opponent_progress":
        setOpponentProgress(data.progress);
        setOpponentWpm(data.wpm);
        break;

      case "game_finished":
        setResults(data.results);
        setGameState("results");
        break;

      case "player_disconnected":
        setError(data.message);
        break;

      case "error":
        setError(data.message);
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  };

  const createRoom = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "create_room" }));
    } else {
      setError("Not connected to server. Please wait for connection.");
    }
  };

  const joinRoom = (roomCode) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomCode,
        })
      );
    } else {
      setError("Not connected to server. Please wait for connection.");
    }
  };

  const sendTypingProgress = (progress, wpm) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "typing_progress",
          progress: progress,
          wpm: wpm,
        })
      );
    }
  };

  const sendPlayerReady = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "player_ready",
          roomId: roomId,
        })
      );
    }
  };

  const sendGameComplete = (wpm, progress) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "game_complete",
          wpm: wpm,
          progress: progress,
        })
      );
    }
  };

  const resetGame = () => {
    setGameState("lobby");
    setRoomId("");
    setPlayerId("");
    setPlayerName("");
    setPrompt("");
    setPlayers([]);
    setResults(null);
    setError("");
    setOpponentProgress(0);
    setOpponentWpm(0);
  };

  useEffect(() => {
    // Connect to WebSocket when component mounts
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          MonkeyType Clone
        </h1>

        {/* Connection Status */}
        <div
          className={`text-center mb-4 px-4 py-2 rounded-lg ${
            isConnected
              ? "bg-green-600 border border-green-600"
              : "bg-red-900 text-red-300 border border-red-600"
          }`}
        >
          {isConnected ? "✓ Connected to server" : "⚠ Connecting to server..."}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {gameState === "lobby" && (
          <Lobby
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isConnected={isConnected}
          />
        )}

        {gameState === "room" && (
          <GameRoom
            roomId={roomId}
            playerId={playerId}
            playerName={playerName}
            prompt={prompt}
            players={players}
            opponentProgress={opponentProgress}
            opponentWpm={opponentWpm}
            onTypingProgress={sendTypingProgress}
            onPlayerReady={sendPlayerReady}
            onGameComplete={sendGameComplete}
          />
        )}

        {gameState === "results" && (
          <Results results={results} onPlayAgain={resetGame} />
        )}
      </div>
    </div>
  );
}

export default App;
