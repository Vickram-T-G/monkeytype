import { useState, useEffect, useRef } from "react";
import TypingArea from "./TypingArea";

const GameRoom = ({
  roomId,
  playerId,
  prompt,
  players,
  opponentProgress,
  opponentWpm,
  onTypingProgress,
  onPlayerReady,
  onGameComplete,
}) => {
  const [gameState, setGameState] = useState("waiting"); // waiting, starting, active, finished
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [myProgress, setMyProgress] = useState(0);
  const [myWpm, setMyWpm] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Calculate WPM
  const calculateWPM = (typed, elapsedMinutes) => {
    if (elapsedMinutes === 0) return 0;
    const words = typed.trim().split(/\s+/).length;
    return Math.round(words / elapsedMinutes);
  };

  // Handle typing progress
  const handleTypingProgress = (progress, text) => {
    setMyProgress(progress);

    if (startTime && gameState === "active") {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      const wpm = calculateWPM(text, elapsedMinutes);
      setMyWpm(wpm);
      onTypingProgress(progress, wpm);
    }
  };

  // Handle game start
  const handleGameStart = () => {
    setGameState("starting");
    setCountdown(3);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setGameState("active");
          setStartTime(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle game end
  const handleGameEnd = () => {
    setGameState("finished");
    clearInterval(timerRef.current);
    onGameComplete(myWpm, myProgress);
  };

  // Timer effect
  useEffect(() => {
    if (gameState === "active") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Check if both players are ready
  useEffect(() => {
    if (players.length === 2 && players.every((p) => p.ready)) {
      handleGameStart();
    }
  }, [players]);

  // Handle ready button
  const handleReady = () => {
    setIsReady(true);
    onPlayerReady();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Room Info */}
      <div className="bg-black-900 rounded-lg shadow-2xl p-6 mb-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Room: {roomId}</h2>
          <div className="text-sm text-white-400">
            {players.length}/2 Players
          </div>
        </div>

        {/* Players Status */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-3 rounded-lg border ${
              playerId === players[0]?.id
                ? "bg-blue-900 border-blue-600 text-blue-200"
                : "bg-black-800 border-black-600 text-black-300"
            }`}
          >
            <div className="font-semibold">
              {players[0]?.name || "Waiting..."}
            </div>
            <div className="text-sm text-black-400">
              {players[0]?.ready ? "Ready" : "Not Ready"}
            </div>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              playerId === players[1]?.id
                ? "bg-blue-900 border-blue-600 text-blue-200"
                : "bg-black-800 border-black-600 text-black-300"
            }`}
          >
            <div className="font-semibold">
              {players[1]?.name || "Waiting..."}
            </div>
            <div className="text-sm text-black-400">
              {players[1]?.ready ? "Ready" : "Not Ready"}
            </div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      {gameState === "waiting" && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-6 mb-6 border border-black-700">
          <h3 className="text-lg font-semibold text-center text-white mb-4">
            Waiting for players to be ready
          </h3>
          {!isReady && (
            <button
              onClick={handleReady}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 border border-green-500"
            >
              I'm Ready
            </button>
          )}
          {isReady && (
            <div className="text-center text-green-400 font-semibold">
              ✓ Ready! Waiting for opponent...
            </div>
          )}
        </div>
      )}

      {/* Countdown */}
      {gameState === "starting" && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-6 mb-6 border border-black-700">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Get Ready!</h3>
            <div className="text-6xl font-bold text-blue-400">{countdown}</div>
          </div>
        </div>
      )}

      {/* Timer */}
      {gameState === "active" && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-4 mb-6 border border-black-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{timeLeft}s</div>
            <div className="text-sm text-black-400">Time Remaining</div>
          </div>
        </div>
      )}

      {/* Typing Area */}
      {gameState === "active" && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-6 mb-6 border border-black-700">
          <TypingArea
            prompt={prompt}
            onProgress={handleTypingProgress}
            disabled={gameState !== "active"}
          />
        </div>
      )}

      {/* Progress Display */}
      {(gameState === "active" || gameState === "finished") && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-6 border border-black-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Progress</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* My Progress */}
            <div>
              <div className="font-semibold text-blue-400 mb-2">
                You ({myWpm} WPM)
              </div>
              <div className="w-full bg-black-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${myProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-black-400 mt-1">
                {Math.round(myProgress)}%
              </div>
            </div>

            {/* Opponent Progress */}
            <div>
              <div className="font-semibold text-red-400 mb-2">
                Opponent ({opponentWpm} WPM)
              </div>
              <div className="w-full bg-black-700 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${opponentProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-black-400 mt-1">
                {Math.round(opponentProgress)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Display (when not typing) */}
      {gameState !== "active" && (
        <div className="bg-black-900 rounded-lg shadow-2xl p-6 border border-black-700">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Text to Type
          </h3>
          <div className="bg-black-800 p-4 rounded-lg border border-black-600">
            <p className="text-black-300 leading-relaxed">{prompt}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
