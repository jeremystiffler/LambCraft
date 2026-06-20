import React from "react";
import { motion } from "framer-motion";
import { BLOCK_TYPES, getBlockColor } from "../data/blocks";

const itemIcon = (slot) => {
  if (slot.type === "tool") {
    const icons = { catcher: "🪤", sword: "⚔️", pickaxe: "⛏️" };
    return <div className="text-2xl" aria-hidden>{icons[slot.id] || "🔧"}</div>;
  }
  const b = BLOCK_TYPES[slot.id];
  if (!b) return null;
  return (
    <div
      className="w-8 h-8 rounded-md border-2 border-slate-700/30"
      style={{ background: getBlockColor(slot.id) }}
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
  isNight,
  dayNightFactor,
  health,
  maxHealth,
  inventory,
  sheepAttacks,
}) {
  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

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
          <span data-testid="hud-username" className="font-heading font-bold text-slate-800 text-lg">
            {username}
          </span>
        </motion.div>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto flex gap-2 items-center"
        >
          {/* Day/Night indicator */}
          <div className={`rounded-full px-3 py-1 border-4 border-white shadow-lg font-heading font-bold text-sm ${isNight ? 'bg-indigo-900 text-indigo-200' : 'bg-yellow-300 text-yellow-800'}`}>
            {isNight ? "🌙 Night" : "☀️ Day"}
          </div>

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
            title="Inventory"
          >
            🎒
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

      {/* Health bar */}
      <div className="absolute top-16 left-3 pointer-events-auto">
        <div className="bg-black/30 rounded-full px-3 py-1 flex items-center gap-2">
          <span className="text-sm">❤️</span>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${healthPercent}%`,
                backgroundColor: healthPercent > 50 ? '#4ade80' : healthPercent > 25 ? '#facc15' : '#ef4444',
              }}
            />
          </div>
          <span className="text-xs text-white font-bold">{health}/{maxHealth}</span>
        </div>
      </div>

      {/* Sheep attacks */}
      {sheepAttacks && sheepAttacks.length > 0 && (
        <div className="absolute top-24 left-3 pointer-events-auto flex gap-1">
          {sheepAttacks.map((atk, i) => (
            <div key={i} className="bg-purple-600/80 rounded-full px-2 py-0.5 text-xs text-white font-bold border border-purple-400">
              ✨ {atk.name}
            </div>
          ))}
        </div>
      )}

      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-8 h-8 relative">
          <div className="absolute left-1/2 top-0 w-[2px] h-3 -translate-x-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute left-1/2 bottom-0 w-[2px] h-3 -translate-x-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute top-1/2 left-0 h-[2px] w-3 -translate-y-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute top-1/2 right-0 h-[2px] w-3 -translate-y-1/2 bg-white rounded-sm shadow-md" />
          <div className="absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* Hotbar */}
      <div
        data-testid="hotbar"
        className="pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/85 backdrop-blur-sm rounded-2xl p-2 border-4 border-white shadow-2xl"
      >
        {hotbar.map((slot, i) => {
          const count = slot.type === "block" ? (inventory?.[slot.id] || 0) : null;
          return (
            <button
              key={i}
              data-testid={`hotbar-slot-${i}`}
              onClick={() => onSelect(i)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all bg-white border-3 ${
                selected === i
                  ? "border-yellow-400 scale-110 shadow-lg ring-2 ring-yellow-300"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {itemIcon(slot)}
              {count !== null && count > 0 && (
                <span className="text-[9px] font-bold text-slate-600 leading-none">{count}</span>
              )}
              <span className="text-[8px] font-bold text-slate-400 leading-none">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected item name */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-black/40 rounded-full px-3 py-1 text-white text-sm font-bold">
          {hotbar[selected]?.name || ""}
        </div>
      </div>
    </div>
  );
}
