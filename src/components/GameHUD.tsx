import { useGameStore } from "@/store/gameStore";

export function GameHUD() {
  const { level, score, lives, isPlaying, isPaused, togglePause } = useGameStore();

  if (!isPlaying) return null;

  return (
    <div className="flex justify-between items-center w-full max-w-[400px] mx-auto px-4 py-2">
      <div className="text-cyan-400 font-bold text-lg">SCORE: {score}</div>
      <button
        onClick={togglePause}
        className="touch-target min-w-[44px] text-white font-semibold hover:text-cyan-400"
      >
        {isPaused ? "▶" : "⏸"} LVL {level}
      </button>
      <div className="flex gap-1">
        {Array.from({ length: lives }, (_, i) => (
          <span key={i} className="text-red-500 text-xl">❤</span>
        ))}
      </div>
    </div>
  );
}
