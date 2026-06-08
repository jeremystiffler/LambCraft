import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Toasts({ toasts }) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            data-testid={t.kind === "catch" ? "catch-toast" : "robber-toast"}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className={`rounded-full py-3 px-6 shadow-xl flex items-center gap-3 font-bold text-lg border-4 font-body ${
              t.kind === "catch"
                ? "bg-green-100 text-green-700 border-green-400"
                : "bg-orange-100 text-orange-700 border-orange-400"
            }`}
          >
            <span className="text-2xl">{t.kind === "catch" ? "🎉" : "😅"}</span>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
