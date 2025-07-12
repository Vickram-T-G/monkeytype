import { useState } from "react";

const Lobby = ({ onCreateRoom, onJoinRoom, isConnected }) => {
  const [roomCode, setRoomCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* <div className="bg--900 rounded-lg shadow-2xl p-8 border border-gray-700"> */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Welcome to MonkeyType Clone
        </h2>

        <p className="text-gray-300 text-center mb-8">
          Challenge your friend to a typing duel! Create a room or join an
          existing one.
        </p>

        {!isConnected && (
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-300 px-4 py-3 rounded mb-6">
            Please wait for connection to server...
          </div>
        )}

        {!showJoinForm ? (
          <div className="space-y-4">
            <button
              onClick={onCreateRoom}
              disabled={!isConnected}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 ${
                isConnected
                  ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
              }`}
            >
              Create New Room
            </button>

            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>

            <button
              onClick={() => setShowJoinForm(true)}
              disabled={!isConnected}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 ${
                isConnected
                  ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
              }`}
            >
              Join Existing Room
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label
                htmlFor="roomCode"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Room Code
              </label>
              <input
                type="text"
                id="roomCode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                disabled={!isConnected}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400 ${
                  !isConnected
                    ? "border-gray-600 cursor-not-allowed"
                    : "border-gray-600"
                }`}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!isConnected}
                className={`flex-1 font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                  isConnected
                    ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                }`}
              >
                Join Room
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setRoomCode("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 border border-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Lobby;
