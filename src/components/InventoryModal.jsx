import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BLOCK_TYPES, getBlockColor } from "../data/blocks";

export default function InventoryModal({ open, onClose, inventory, meatInventory }) {
  const blockEntries = Object.entries(inventory || {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const meatEntries = Object.entries(meatInventory || {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const totalItems = blockEntries.reduce((s, [, n]) => s + n, 0) + meatEntries.reduce((s, [, n]) => s + n, 0);

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
                  🎒 Inventory
                </h2>
                <p className="text-slate-600 font-body">
                  {totalItems} item{totalItems === 1 ? "" : "s"} total
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

            {totalItems === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-body text-lg">
                Empty — mine some blocks or catch sheep!
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 flex-1 space-y-4">
                {/* Blocks */}
                {blockEntries.length > 0 && (
                  <>
                    <h3 className="font-heading text-lg font-bold text-amber-600">Blocks</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {blockEntries.map(([id, count]) => {
                        const block = BLOCK_TYPES[id];
                        return (
                          <div
                            key={id}
                            className="bg-white rounded-xl border-2 border-amber-200 p-3 flex items-center gap-3"
                          >
                            <div
                              className="w-10 h-10 rounded-lg border-2 border-slate-700/30 flex-shrink-0"
                              style={{ background: getBlockColor(id) }}
                            />
                            <div className="min-w-0">
                              <p className="font-body font-semibold text-slate-700 text-sm truncate">
                                {block?.name || id}
                              </p>
                              <p className="font-heading font-bold text-amber-700 text-lg">
                                ×{count}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Meat / Loot */}
                {meatEntries.length > 0 && (
                  <>
                    <h3 className="font-heading text-lg font-bold text-amber-600">Loot</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {meatEntries.map(([name, count]) => (
                        <div
                          key={name}
                          className="bg-white rounded-xl border-2 border-amber-200 p-3 flex items-center justify-between"
                        >
                          <span className="font-body font-semibold text-slate-700 text-sm">
                            🍗 {name}
                          </span>
                          <span className="font-heading font-bold text-amber-700 text-lg">
                            ×{count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
