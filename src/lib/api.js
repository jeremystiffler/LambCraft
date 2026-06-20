// Local-only API — no backend required. Uses localStorage for persistence.

const STORAGE_KEY = "lampcraft_players";

const getPlayers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const savePlayers = (players) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
};

export const loginPlayer = async (username) => {
  const players = getPlayers();
  if (players[username]) {
    return players[username];
  }
  const player = {
    username,
    caught_sheep: [],
    meat_inventory: {},
    blocks_placed: 0,
    blocks_broken: 0,
    inventory: {},
  };
  players[username] = player;
  savePlayers(players);
  return player;
};

export const savePlayer = async (state) => {
  const players = getPlayers();
  if (players[state.username]) {
    players[state.username] = { ...players[state.username], ...state };
    savePlayers(players);
  }
  return players[state.username];
};

export const fetchLeaderboard = async () => {
  const players = getPlayers();
  return Object.values(players).map((p) => ({
    username: p.username,
    caught: (p.caught_sheep || []).length,
  }));
};
