import React, { useState } from "react";
import { motion } from "framer-motion";

export default function StartScreen({ onStart, loading, error }) {
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return;
    onStart(name.trim());
  };

  return (
    <div
      data-testid="start-screen"
      className="absolute inset-0 z-30 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #FDE68A 0%, #BAE6FD 40%, #86EFAC 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="bg-white/95 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border-[6px] border-white shadow-2xl max-w-md w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-2"
          aria-hidden
        >
          🐑
        </motion.div>
        <h1
          className="font-heading text-5xl md:text-6xl font-bold tracking-tight"
          style={{
            color: "#FACC15",
            WebkitTextStroke: "3px #7A3A0A",
            textShadow: "0 6px 0 #C2410C",
          }}
        >
          Lambcraft
        </h1>
        <p className="font-body text-lg text-slate-600 mt-3 mb-6">
          Catch all 50 sheep before the Robber does!
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            data-testid="username-input"
            type="text"
            autoFocus
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-14 px-6 rounded-full text-center text-2xl font-bold font-body border-4 border-slate-200 focus:border-green-400 focus:outline-none bg-white"
            maxLength={20}
          />
          {error ? (
            <p data-testid="start-error" className="text-orange-600 font-semibold">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            data-testid="start-game-button"
            disabled={loading || name.trim().length < 2}
            className="w-full bg-green-400 hover:bg-green-500 disabled:opacity-60 text-white rounded-full py-4 text-2xl font-bold font-heading transition-all active:translate-y-1"
            style={{ boxShadow: "0 8px 0 0 #16a34a" }}
          >
            {loading ? "Loading…" : "Start Playing!"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-500 font-body">
          <p>Tip: click the screen to look around with the mouse.</p>
          <p>WASD to move · Space to jump · 1–9 to pick items</p>
        </div>
      </motion.div>
    </div>
  );
}
