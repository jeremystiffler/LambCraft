import React, { useCallback, useEffect, useRef, useState } from "react";
import StartScreen from "./components/StartScreen";
import HUD from "./components/HUD";
import Sheepdex from "./components/Sheepdex";
import InventoryModal from "./components/InventoryModal";
import HelpModal from "./components/HelpModal";
import Toasts from "./components/Toasts";
import PausedOverlay from "./components/PausedOverlay";
import { LambcraftGame } from "./game/Engine";
import { HOTBAR_DEFAULT } from "./data/blocks";
import { SHEEP_TYPES } from "./data/sheep";
import { loginPlayer, savePlayer } from "./lib/api";
import "./App.css";

const STORAGE_KEY = "lambcraft_username";

function App() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const stateRef = useRef({
    caught: [],
    meat: {},
    blocksPlaced: 0,
    blocksBroken: 0,
  });

  const [username, setUsername] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(0);
  const [caught, setCaught] = useState([]);
  const [meatInventory, setMeatInventory] = useState({});
  const [showSheepdex, setShowSheepdex] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Keep stateRef in sync for the save callback
  useEffect(() => {
    stateRef.current.caught = caught;
    stateRef.current.meat = meatInventory;
  }, [caught, meatInventory]);

  const pushToast = useCallback((kind, text) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  // ----- Login -----
  const handleStart = async (name) => {
    setLoginError("");
    setLoginLoading(true);
    try {
      const player = await loginPlayer(name);
      setUsername(player.username);
      setCaught(player.caught_sheep || []);
      setMeatInventory(player.meat_inventory || {});
      stateRef.current = {
        caught: player.caught_sheep || [],
        meat: player.meat_inventory || {},
        blocksPlaced: player.blocks_placed || 0,
        blocksBroken: player.blocks_broken || 0,
      };
      localStorage.setItem(STORAGE_KEY, player.username);
      setRunning(true);
    } catch (e) {
      const msg = e?.response?.data?.detail || "Could not start game. Try again.";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  // ----- Game lifecycle -----
  useEffect(() => {
    if (!running || !containerRef.current || gameRef.current) return;
    const game = new LambcraftGame(containerRef.current, {
      onCatch: (sheepType) => {
        setCaught((prev) => (prev.includes(sheepType.id) ? prev : [...prev, sheepType.id]));
        setMeatInventory((prev) => ({
          ...prev,
          [sheepType.meat]: (prev[sheepType.meat] || 0) + 1,
        }));
        pushToast("catch", `Caught a ${sheepType.name}! +1 ${sheepType.meat}`);
      },
      onRobber: (sheepType) => {
        pushToast("robber", `The Robber snatched a ${sheepType.name}!`);
      },
      onSelectChange: (i) => setSelected(i),
      onAutosaveTick: (info) => {
        stateRef.current.blocksPlaced = info.blocksPlaced;
        stateRef.current.blocksBroken = info.blocksBroken;
        // fire and forget save
        savePlayer({
          username,
          caught_sheep: stateRef.current.caught,
          meat_inventory: stateRef.current.meat,
          blocks_placed: info.blocksPlaced,
          blocks_broken: info.blocksBroken,
        }).catch(() => {});
      },
    });
    gameRef.current = game;

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, [running, username, pushToast]);

  // Sync selected slot to engine
  useEffect(() => {
    if (gameRef.current) gameRef.current.setSelected(selected);
  }, [selected]);

  // Pointer lock pause detection
  useEffect(() => {
    if (!running) return;
    const handler = () => {
      const locked = document.pointerLockElement === gameRef.current?.renderer?.domElement;
      // Pause only if no modal open and pointer released
      if (!locked && !showSheepdex && !showInventory && !showHelp) {
        setPaused(true);
      } else if (locked) {
        setPaused(false);
      }
    };
    document.addEventListener("pointerlockchange", handler);
    return () => document.removeEventListener("pointerlockchange", handler);
  }, [running, showSheepdex, showInventory, showHelp]);

  // When a modal opens, release pointer lock
  useEffect(() => {
    if (showSheepdex || showInventory || showHelp) {
      if (document.pointerLockElement) document.exitPointerLock();
    }
  }, [showSheepdex, showInventory, showHelp]);

  const totalMeat = Object.values(meatInventory).reduce((s, n) => s + n, 0);

  return (
    <div className="App fixed inset-0 overflow-hidden font-body select-none">
      {/* 3D canvas mount */}
      <div
        ref={containerRef}
        data-testid="game-root"
        className="absolute inset-0 z-0 bg-sky-200"
      />

      {!running && (
        <StartScreen
          onStart={handleStart}
          loading={loginLoading}
          error={loginError}
        />
      )}

      {running && (
        <>
          <HUD
            username={username}
            caughtCount={caught.length}
            totalSheep={SHEEP_TYPES.length}
            hotbar={HOTBAR_DEFAULT}
            selected={selected}
            onSelect={(i) => setSelected(i)}
            onOpenSheepdex={() => setShowSheepdex(true)}
            onOpenInventory={() => setShowInventory(true)}
            onOpenHelp={() => setShowHelp(true)}
            meatCount={totalMeat}
          />
          <Toasts toasts={toasts} />
          <Sheepdex
            open={showSheepdex}
            caughtIds={caught}
            onClose={() => setShowSheepdex(false)}
          />
          <InventoryModal
            open={showInventory}
            meatInventory={meatInventory}
            onClose={() => setShowInventory(false)}
          />
          <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
          <PausedOverlay
            visible={paused && !showSheepdex && !showInventory && !showHelp}
            onResume={() => {
              const el = gameRef.current?.renderer?.domElement;
              if (el) el.requestPointerLock();
              setPaused(false);
            }}
          />
        </>
      )}
    </div>
  );
}

export default App;
