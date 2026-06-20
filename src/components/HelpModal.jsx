import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROW = "flex justify-between gap-3 text-base md:text-lg font-body py-1";

export default function HelpModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="help-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="bg-sky-50 rounded-[2rem] border-[6px] border-sky-300 shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-3xl font-bold text-sky-700">
                How to Play
              </h2>
              <button
                data-testid="help-close-button"
                onClick={onClose}
                className="bg-red-400 hover:bg-red-500 text-white rounded-full w-10 h-10 text-2xl font-bold shadow-lg border-4 border-white"
              >
                ×
              </button>
            </div>
            <div className="text-slate-700 space-y-1">
              <div className={ROW}><span>Move</span><span className="font-bold">W A S D</span></div>
              <div className={ROW}><span>Jump</span><span className="font-bold">Space</span></div>
              <div className={ROW}><span>Look around</span><span className="font-bold">Mouse</span></div>
              <div className={ROW}><span>Attack / Catch / Mine</span><span className="font-bold">Left click</span></div>
              <div className={ROW}><span>Place block</span><span className="font-bold">Right click</span></div>
              <div className={ROW}><span>Pick item</span><span className="font-bold">1 – 0</span></div>
              <div className={ROW}><span>Open Sheepdex</span><span className="font-bold">🐑 button</span></div>
              <div className={ROW}><span>Pause</span><span className="font-bold">Esc</span></div>
            </div>
            <div className="mt-5 p-4 rounded-2xl bg-white border-2 border-sky-200 space-y-2">
              <p className="font-body text-slate-700">
                <strong className="font-heading text-amber-600">🌙 Night & Day!</strong>{" "}
                The world cycles between day and night. The Robber only steals sheep at night!
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-red-500">⚔️ Weapons!</strong>{" "}
                Use the Sword to fight mobs and the Pickaxe to mine blocks faster.
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-green-600">⛏️ Block Drops!</strong>{" "}
                Mine blocks to collect them. You can place blocks from your inventory.
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-purple-600">🐑 Special Sheep!</strong>{" "}
                Some sheep have special attacks (Fire, Ice, Rainbow Beam, etc.). Catch them to unlock their power!
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-blue-600">🌍 Biomes!</strong>{" "}
                Explore Plains, Forests, Deserts, Volcanoes, and Fantasy lands. Each has unique blocks and terrain.
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-amber-700">🏘️ Villages!</strong>{" "}
                Find villages with friendly villagers. They're peaceful and welcoming!
              </p>
              <p className="font-body text-slate-700">
                <strong className="font-heading text-orange-600">🐄 Mobs!</strong>{" "}
                Cows, pigs, chickens, horses, and bunnies roam the world. They drop loot when defeated.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
