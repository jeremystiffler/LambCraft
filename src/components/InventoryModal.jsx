import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryModal({ open, onClose, meatInventory }) {
  const entries = Object.entries(meatInventory || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, n]) => sum + n, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-testid="inventory-modal"
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
            className="bg-amber-50 rounded-[2rem] border-[6px] border-amber-300 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-3xl font-bold text-amber-700">
                  Meat Pantry
                </h2>
                <p className="text-slate-600 font-body">
                  {total} yummy item{total === 1 ? "" : "s"} collected
                </p>
              </div>
              <button
                data-testid="inventory-close-button"
                onClick={onClose}
                className="bg-red-400 hover:bg-red-500 text-white rounded-full w-12 h-12 text-2xl font-bold shadow-lg border-4 border-white"
              >
                ×
              </button>
            </div>
            {entries.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-body text-lg">
                No meat yet — catch some sheep!
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {entries.map(([name, count]) => (
                  <div
                    key={name}
                    data-testid={`inventory-item-${name.replace(/\s+/g, '-').toLowerCase()}`}
                    className="bg-white rounded-2xl border-2 border-amber-200 p-3 flex items-center justify-between"
                  >
                    <span className="font-body font-semibold text-slate-700">
                      🍗 {name}
                    </span>
                    <span className="font-heading font-bold text-amber-700 text-xl">
                      ×{count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
