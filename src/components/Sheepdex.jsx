import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SHEEP_TYPES, RARITY_COLORS } from "../data/sheep";

function SheepIcon({ wool, accent, caught }) {
  return (
    <svg viewBox="0 0 64 64" className={`w-12 h-12 ${caught ? "" : "opacity-40 grayscale"}`} aria-hidden>
      <ellipse cx="32" cy="42" rx="20" ry="14" fill={wool} stroke="#1f2937" strokeWidth="2" />
      <circle cx="20" cy="32" r="6" fill={wool} stroke="#1f2937" strokeWidth="2" />
      <circle cx="44" cy="32" r="6" fill={wool} stroke="#1f2937" strokeWidth="2" />
      <circle cx="32" cy="28" r="8" fill={wool} stroke="#1f2937" strokeWidth="2" />
      <ellipse cx="48" cy="38" rx="7" ry="6" fill={accent} stroke="#1f2937" strokeWidth="2" />
      <circle cx="50" cy="36" r="1.2" fill="#1f2937" />
      <rect x="22" y="50" width="3" height="6" fill={accent} />
      <rect x="38" y="50" width="3" height="6" fill={accent} />
    </svg>
  );
}

export default function Sheepdex({ open, onClose, caughtIds }) {
  const caughtSet = new Set(caughtIds);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="sheepdex-modal"
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
            className="bg-orange-50 rounded-[2rem] border-[6px] border-orange-300 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-orange-600">
                  Sheepdex
                </h2>
                <p className="text-slate-600 font-body">
                  Caught <strong>{caughtSet.size}</strong> of {SHEEP_TYPES.length}
                </p>
              </div>
              <button
                data-testid="sheepdex-close-button"
                onClick={onClose}
                className="bg-red-400 hover:bg-red-500 text-white rounded-full w-12 h-12 text-2xl font-bold shadow-lg border-4 border-white transition-transform hover:scale-105 active:scale-95"
                aria-label="Close Sheepdex"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 overflow-y-auto pr-2 flex-1">
              {SHEEP_TYPES.map((s) => {
                const caught = caughtSet.has(s.id);
                return (
                  <div
                    key={s.id}
                    data-testid={`sheepdex-card-${s.id}`}
                    className={`bg-white rounded-2xl p-3 border-4 ${
                      caught ? "border-yellow-300" : "border-slate-200"
                    } flex flex-col items-center text-center shadow-sm relative`}
                  >
                    <span
                      className="absolute top-1 right-2 text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: RARITY_COLORS[s.rarity] }}
                    >
                      {s.rarity}
                    </span>
                    <SheepIcon wool={s.wool} accent={s.accent} caught={caught} />
                    <p className="mt-1 font-heading font-bold text-sm text-slate-800 leading-tight">
                      {caught ? s.name : "???"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-body mt-1">
                      {caught ? `🍗 ${s.meat}` : "Not caught yet"}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
