import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { GameCanvas } from "./components/GameCanvas";
import { GameHUD } from "./components/GameHUD";
import { useGameStore } from "./store/gameStore";

function App() {
  const { isPlaying, startGame, score, gameOver } = useGameStore();

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 pb-8">
      <div className="absolute top-4 right-4 z-10">
        <WalletMultiButton className="!bg-gradient-to-r !from-cyan-500 !to-fuchsia-500 !rounded-xl !min-h-[44px]" />
      </div>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 max-w-md w-full"
          >
            <h1 className="font-bold text-4xl md:text-5xl text-center bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              ARKANOID
            </h1>
            <p className="text-gray-400 text-center text-sm">
              Break bricks. Get power-ups. Dominate the leaderboard.
            </p>
            <motion.button
              onClick={startGame}
              className="touch-target min-h-[52px] px-12 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              PLAY
            </motion.button>
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
              <div><div className="text-cyan-400 font-semibold">10</div><div>Levels</div></div>
              <div><div className="text-fuchsia-400 font-semibold">8</div><div>Power-ups</div></div>
              <div><div className="text-purple-400 font-semibold">∞</div><div>Fun</div></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 w-full"
          >
            <GameHUD />
            <GameCanvas />
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 gap-4 p-4"
        >
          <h2 className="font-bold text-2xl text-red-500">GAME OVER</h2>
          <p className="text-white text-xl">Score: {score}</p>
          <button
            onClick={startGame}
            className="touch-target min-h-[52px] px-8 py-4 rounded-xl font-bold bg-cyan-500 text-black"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </main>
  );
}

export default App;
