import React from "react";
import { motion } from "framer-motion";

export default function PausedOverlay({ visible, onResume }) {
  if (!visible) return null;
  return (
    <div
      data-testid="paused-overlay"
      className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm pointer-events-auto"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="bg-white/95 rounded-[2rem] p-8 border-[6px] border-white shadow-2xl text-center max-w-sm"
      >
        <div className="text-6xl mb-2">🐑</div>
        <h2 className="font-heading text-4xl font-bold text-slate-800 mb-2">Paused</h2>
        <p className="font-body text-slate-600 mb-6">
          Click the button below (or anywhere on the world) to keep playing.
        </p>
        <button
          data-testid="resume-button"
          onClick={onResume}
          className="bg-green-400 hover:bg-green-500 text-white rounded-full py-3 px-8 text-xl font-heading font-bold transition-all active:translate-y-1"
          style={{ boxShadow: "0 6px 0 0 #16a34a" }}
        >
          Resume Playing
        </button>
      </motion.div>
    </div>
  );
}
