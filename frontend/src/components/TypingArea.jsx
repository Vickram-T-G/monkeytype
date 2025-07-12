import { useState, useEffect, useRef } from "react";

const TypingArea = ({ prompt, onProgress, disabled }) => {
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const textareaRef = useRef(null);

  // Calculate progress percentage
  const progress = Math.round((currentIndex / prompt.length) * 100);

  // Handle text input
  const handleInput = (e) => {
    if (disabled || isComplete) return;

    const value = e.target.value;
    setTypedText(value);

    // Check each character
    const newErrors = [];
    let newCurrentIndex = 0;

    for (let i = 0; i < value.length && i < prompt.length; i++) {
      if (value[i] === prompt[i]) {
        newCurrentIndex = i + 1;
      } else {
        newErrors.push(i);
      }
    }

    setCurrentIndex(newCurrentIndex);
    setErrors(newErrors);

    // Check if completed
    if (newCurrentIndex === prompt.length) {
      setIsComplete(true);
    }

    // Report progress
    onProgress(progress, value);
  };

  // Handle keydown for special keys
  const handleKeyDown = (e) => {
    if (disabled || isComplete) return;

    // Prevent backspace beyond current progress
    if (e.key === "Backspace" && typedText.length <= currentIndex) {
      e.preventDefault();
    }
  };

  // Focus textarea when component mounts or game starts
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Reset when prompt changes
  useEffect(() => {
    setTypedText("");
    setCurrentIndex(0);
    setErrors([]);
    setIsComplete(false);
  }, [prompt]);

  // Render prompt with highlighting
  const renderPrompt = () => {
    const chars = prompt.split("");
    return chars.map((char, index) => {
      let className = "text-gray-500";

      if (index < currentIndex) {
        className = "text-green-400"; // Correctly typed
      } else if (index === currentIndex) {
        className = "text-blue-400 bg-blue-900"; // Current position
      } else if (errors.includes(index)) {
        className = "text-red-400 bg-red-900"; // Error
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Prompt Display */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 min-h-[100px]">
        <div className="text-lg leading-relaxed font-mono">
          {renderPrompt()}
        </div>
      </div>

      {/* Typing Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={typedText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isComplete}
          placeholder="Start typing here..."
          className="w-full p-4 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg leading-relaxed resize-none bg-gray-800 text-white placeholder-gray-400"
          rows={4}
          style={{
            backgroundColor: disabled ? "#374151" : "#1f2937",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />

        {disabled && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-300 font-semibold">
              {isComplete ? "Completed!" : "Waiting for game to start..."}
            </span>
          </div>
        )}
      </div>

      {/* Progress Info */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Progress: {progress}%</span>
        <span>
          Characters: {currentIndex}/{prompt.length}
        </span>
        <span>Errors: {errors.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TypingArea;
