const Results = ({ results, onPlayAgain }) => {
  if (!results || results.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-2xl p-8 text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Game Results</h2>
          <p className="text-gray-300">No results available</p>
        </div>
      </div>
    );
  }

  // Sort results by WPM (highest first)
  const sortedResults = [...results].sort((a, b) => b.wpm - a.wpm);
  const winner = sortedResults[0];
  const isTie =
    sortedResults.length > 1 && sortedResults[0].wpm === sortedResults[1].wpm;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Game Results
        </h2>

        {/* Winner Announcement */}
        <div className="text-center mb-8">
          {isTie ? (
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              🏆 It's a Tie! 🏆
            </div>
          ) : (
            <div className="text-2xl font-bold text-green-400 mb-2">
              🏆 {winner.name} Wins! 🏆
            </div>
          )}
          <p className="text-gray-300">
            Both players achieved {winner.wpm} WPM
          </p>
        </div>

        {/* Results Table */}
        <div className="space-y-4 mb-8">
          {sortedResults.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 rounded-lg border-2 ${
                index === 0 && !isTie
                  ? "border-green-600 bg-green-900"
                  : "border-gray-600 bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`text-2xl ${
                      index === 0 && !isTie
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}
                  >
                    {index === 0 ? "🥇" : "🥈"}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-white">
                      {player.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Progress: {Math.round(player.progress)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">
                    {player.wpm}
                  </div>
                  <div className="text-sm text-gray-400">WPM</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">
            Game Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Highest WPM:</span>
              <span className="font-semibold ml-2 text-white">
                {winner.wpm}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Average WPM:</span>
              <span className="font-semibold ml-2 text-white">
                {Math.round(
                  results.reduce((sum, p) => sum + p.wpm, 0) / results.length
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total Players:</span>
              <span className="font-semibold ml-2 text-white">
                {results.length}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Game Duration:</span>
              <span className="font-semibold ml-2 text-white">30 seconds</span>
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 text-lg border border-blue-500"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
