import React from "react";
import { motion } from "framer-motion";
import { BLOCK_TYPES } from "../data/blocks";

const itemIcon = (slot) => {
  if (slot.type === "tool") {
    return (
      <div className="text-2xl" aria-hidden>🪤</div>
    );
  }
  const b = BLOCK_TYPES[slot.id];
  if (!b) return null;
  return (
    <div
      className="w-8 h-8 rounded-md border-2 border-slate-700/30"
      style={{ background: b.color }}
      aria-hidden
    />
  );
};

export default function HUD({
  username,
  caughtCount,
  totalSheep,
  hotbar,
  selected,
  onSelect,
  onOpenSheepdex,
  onOpenHelp,
  onOpenInventory,
  meatCount,
}) {
  return (
    <div data-testid="hud-container" className="pointer-events-none absolute inset-0 z-20">
      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 border-4 border-white shadow-lg flex items-center gap-3"
        >
          <span className="text-2xl" aria-hidden>👤</span>
          <span
            data-testid="hud-username"
            className="font-heading font-bold text-slate-800 text-lg"
          >
            {username}
          </span>
        </motion.div>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex gap-2"
        >
          <button
            data-testid="sheepdex-toggle-button"
            onClick={onOpenSheepdex}
            className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-full px-4 py-2 border-4 border-white shadow-lg font-heading font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 5px 0 0 #d97706" }}
          >
            🐑 <span data-testid="hud-caught-count">{caughtCount}</span>
            <span className="text-yellow-100">/{totalSheep}</span>
          </button>
          <button
            data-testid="inventory-toggle-button"
            onClick={onOpenInventory}
            className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-4 py-2 border-4 border-white shadow-lg font-heading font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 5px 0 0 #c2410c" }}
            title="Meat inventory"
          >
            🍗 <span data-testid="hud-meat-count">{meatCount}</span>
          </button>
          <button
            data-testid="help-toggle-button"
            onClick={onOpenHelp}
            className="bg-sky-400 hover:bg-sky-500 text-white rounded-full w-12 h-12 border-4 border-white shadow-lg font-heading font-bold transition-transform hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 5px 0 0 #0369a1" }}
            title="Help"
          >
            ?
          </button>
        </motion.div>
      </div>

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-6 h-6 relative">
          <div className="absolute left-1/2 top-0 w-[3px] h-2 -translate-x-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute left-1/2 bottom-0 w-[3px] h-2 -translate-x-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute top-1/2 left-0 h-[3px] w-2 -translate-y-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute top-1/2 right-0 h-[3px] w-2 -translate-y-1/2 bg-white rounded-sm shadow-md" />
        </div>
      </div>

      {/* Hotbar */}
      <div
        data-testid="hotbar"
        className="pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 bg-white/85 backdrop-blur-sm rounded-2xl p-2 border-4 border-white shadow-2xl"
      >
        {hotbar.map((slot, i) => (
          <button
            key={i}
            data-testid={`hotbar-slot-${i}`}
            onClick={() => onSelect(i)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all bg-white border-4 ${
              selected === i
                ? "border-yellow-400 scale-110 shadow-lg"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {itemIcon(slot)}
            <span className="text-[10px] font-bold text-slate-500 leading-none">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
