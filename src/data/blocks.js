// Block palette — Minecraft-style with top/side/bottom colors for texture
export const BLOCK_TYPES = {
  // --- Natural ---
  grass:     { id: "grass",     name: "Grass",       topColor: "#6DBF3A", sideColor: "#8B6B3A", bottomColor: "#6B4E2A", icon: "grass",    hardness: 0.6 },
  dirt:      { id: "dirt",      name: "Dirt",        topColor: "#8B6B3A", sideColor: "#8B6B3A", bottomColor: "#6B4E2A", icon: "dirt",     hardness: 0.5 },
  stone:     { id: "stone",     name: "Stone",       topColor: "#9AA3AD", sideColor: "#8A939D", bottomColor: "#7A838D", icon: "stone",    hardness: 1.5 },
  sand:      { id: "sand",      name: "Sand",        topColor: "#F5E2A5", sideColor: "#E5D295", bottomColor: "#D5C285", icon: "sand",     hardness: 0.5 },
  gravel:    { id: "gravel",    name: "Gravel",      topColor: "#A0A0A0", sideColor: "#909090", bottomColor: "#808080", icon: "gravel",   hardness: 0.6 },
  clay:      { id: "clay",      name: "Clay",        topColor: "#A0B0C0", sideColor: "#90A0B0", bottomColor: "#8090A0", icon: "clay",     hardness: 0.6 },

  // --- Wood ---
  wood:      { id: "wood",      name: "Wood Log",    topColor: "#C49853", sideColor: "#A07043", bottomColor: "#C49853", icon: "wood",     hardness: 2.0 },
  planks:    { id: "planks",    name: "Planks",      topColor: "#D4A863", sideColor: "#D4A863", bottomColor: "#D4A863", icon: "planks",   hardness: 2.0 },
  leaves:    { id: "leaves",    name: "Leaves",      topColor: "#4ADE80", sideColor: "#3ACE70", bottomColor: "#2ABE60", icon: "leaves",   hardness: 0.2 },
  sapling:   { id: "sapling",   name: "Sapling",     topColor: "#4ADE80", sideColor: "#228B45", bottomColor: "#228B45", icon: "sapling",  hardness: 0.0 },

  // --- Building ---
  brick:     { id: "brick",     name: "Brick",       topColor: "#E07A5F", sideColor: "#D06A4F", bottomColor: "#C05A3F", icon: "brick",    hardness: 2.0 },
  cobble:    { id: "cobble",    name: "Cobblestone", topColor: "#8A8A8A", sideColor: "#7A7A7A", bottomColor: "#6A6A6A", icon: "cobble",   hardness: 2.0 },
  sandstone: { id: "sandstone", name: "Sandstone",   topColor: "#F5E2A5", sideColor: "#E5D295", bottomColor: "#D5C285", icon: "sandstone",hardness: 0.8 },
  glass:     { id: "glass",     name: "Glass",       topColor: "#D0E8F0", sideColor: "#D0E8F0", bottomColor: "#D0E8F0", icon: "glass",    hardness: 0.3, transparent: true },
  plank_wall:{ id: "plank_wall",name: "Plank Wall",  topColor: "#D4A863", sideColor: "#C49853", bottomColor: "#B48843", icon: "plank_wall",hardness: 2.0 },

  // --- Biome-specific ---
  cactus:    { id: "cactus",    name: "Cactus",      topColor: "#2E8B57", sideColor: "#228B45", bottomColor: "#2E8B57", icon: "cactus",   hardness: 0.4 },
  mushroom_r:{ id: "mushroom_r",name: "Red Mushroom",topColor: "#EF4444", sideColor: "#FFFFFF", bottomColor: "#FFFFFF", icon: "mushroom_r",hardness: 0.0 },
  mushroom_b:{ id: "mushroom_b",name: "Brown Mushroom",topColor: "#A07043", sideColor: "#FFFFFF", bottomColor: "#FFFFFF", icon: "mushroom_b",hardness: 0.0 },
  obsidian:  { id: "obsidian",  name: "Obsidian",    topColor: "#1A0A2E", sideColor: "#2A1A3E", bottomColor: "#0A0A1E", icon: "obsidian", hardness: 50 },
  lava_stone:{ id: "lava_stone",name: "Lava Stone",  topColor: "#4A2020", sideColor: "#3A1010", bottomColor: "#2A0000", icon: "lava_stone",hardness: 3.0 },
  snow:      { id: "snow",      name: "Snow",        topColor: "#F8FAFC", sideColor: "#E8EAEC", bottomColor: "#D8DADC", icon: "snow",     hardness: 0.2 },
  ice:       { id: "ice",       name: "Ice",         topColor: "#B5E3F5", sideColor: "#A5D3E5", bottomColor: "#95C3D5", icon: "ice",      hardness: 0.5, transparent: true },
  fantasy_glow: { id: "fantasy_glow", name: "Glow Crystal", topColor: "#C084FC", sideColor: "#A064DC", bottomColor: "#8044BC", icon: "fantasy_glow", hardness: 1.0, emissive: true },
  fantasy_flower: { id: "fantasy_flower", name: "Magic Flower", topColor: "#F472B6", sideColor: "#22D3EE", bottomColor: "#A064DC", icon: "fantasy_flower", hardness: 0.0 },
  crystal:   { id: "crystal",   name: "Crystal",     topColor: "#67E8F9", sideColor: "#57D8E9", bottomColor: "#47C8D9", icon: "crystal",  hardness: 1.5, transparent: true },

  // --- Decorative ---
  flower:    { id: "flower",    name: "Flower",      topColor: "#FB7185", sideColor: "#228B45", bottomColor: "#228B45", icon: "flower",   hardness: 0.0 },
  tulip:     { id: "tulip",     name: "Tulip",       topColor: "#FACC15", sideColor: "#228B45", bottomColor: "#228B45", icon: "tulip",    hardness: 0.0 },
  daisy:     { id: "daisy",     name: "Daisy",       topColor: "#FFFFFF", sideColor: "#228B45", bottomColor: "#228B45", icon: "daisy",    hardness: 0.0 },
  cloud:     { id: "cloud",     name: "Cloud",       topColor: "#FFFFFF", sideColor: "#F0F0F0", bottomColor: "#E0E0E0", icon: "cloud",    hardness: 0.1, transparent: true },
  fence:     { id: "fence",     name: "Fence",       topColor: "#C4884D", sideColor: "#C4884D", bottomColor: "#C4884D", icon: "fence",    hardness: 2.0 },

  // --- Ore ---
  coal_ore:  { id: "coal_ore",  name: "Coal Ore",    topColor: "#5A5A6A", sideColor: "#4A4A5A", bottomColor: "#5A5A6A", icon: "coal_ore", hardness: 3.0 },
  iron_ore:  { id: "iron_ore",  name: "Iron Ore",    topColor: "#B0A090", sideColor: "#A09080", bottomColor: "#B0A090", icon: "iron_ore", hardness: 3.0 },
  diamond_ore:{ id: "diamond_ore",name: "Diamond Ore",topColor: "#67E8F9", sideColor: "#57D8E9", bottomColor: "#67E8F9", icon: "diamond_ore", hardness: 4.0 },

  // --- Water (non-solid) ---
  water:     { id: "water",     name: "Water",       topColor: "#3B82F6", sideColor: "#2563EB", bottomColor: "#1D4ED8", icon: "water",    hardness: -1, liquid: true },
};

// Helper: get the primary color (for hotbar icons, etc.)
export function getBlockColor(blockId) {
  const b = BLOCK_TYPES[blockId];
  if (!b) return "#888888";
  return b.topColor || b.color || "#888888";
}

// Default hotbar — player starts with these
export const HOTBAR_DEFAULT = [
  { type: "tool",  id: "catcher",  name: "Sheep Catcher" },
  { type: "tool",  id: "sword",    name: "Sword" },
  { type: "tool",  id: "pickaxe",  name: "Pickaxe" },
  { type: "block", id: "grass" },
  { type: "block", id: "dirt" },
  { type: "block", id: "stone" },
  { type: "block", id: "wood" },
  { type: "block", id: "planks" },
  { type: "block", id: "brick" },
  { type: "block", id: "fence" },
];

// Crafting recipes: { result: { id, count }, ingredients: { blockId: count } }
export const CRAFTING_RECIPES = [
  { result: { id: "planks", count: 4 }, ingredients: { wood: 1 } },
  { result: { id: "fence", count: 3 },  ingredients: { planks: 2 } },
  { result: { id: "brick", count: 1 },  ingredients: { stone: 1, sand: 1 } },
  { result: { id: "glass", count: 1 },  ingredients: { sand: 2 } },
  { result: { id: "cobble", count: 1 }, ingredients: { gravel: 2, dirt: 1 } },
  { result: { id: "sandstone", count: 1 }, ingredients: { sand: 4 } },
  { result: { id: "plank_wall", count: 2 }, ingredients: { planks: 2 } },
  { result: { id: "snow", count: 4 },   ingredients: { ice: 1 } },
  { result: { id: "crystal", count: 1 }, ingredients: { diamond_ore: 1, fantasy_glow: 1 } },
];

// Block drop table: what you get when you break a block
export function getBlockDrop(blockId) {
  const drops = {
    grass: { id: "dirt", count: 1 },
    dirt: { id: "dirt", count: 1 },
    stone: { id: "cobble", count: 1 },
    sand: { id: "sand", count: 1 },
    gravel: { id: "gravel", count: 1 },
    clay: { id: "clay", count: 1 },
    wood: { id: "wood", count: 1 },
    planks: { id: "planks", count: 1 },
    leaves: { id: "sapling", count: 1 },
    sapling: { id: "sapling", count: 1 },
    brick: { id: "brick", count: 1 },
    cobble: { id: "cobble", count: 1 },
    sandstone: { id: "sandstone", count: 1 },
    glass: { id: "glass", count: 1 },
    plank_wall: { id: "plank_wall", count: 1 },
    cactus: { id: "cactus", count: 1 },
    mushroom_r: { id: "mushroom_r", count: 1 },
    mushroom_b: { id: "mushroom_b", count: 1 },
    obsidian: { id: "obsidian", count: 1 },
    lava_stone: { id: "lava_stone", count: 1 },
    snow: { id: "snow", count: 1 },
    ice: { id: "ice", count: 1 },
    fantasy_glow: { id: "fantasy_glow", count: 1 },
    fantasy_flower: { id: "fantasy_flower", count: 1 },
    crystal: { id: "crystal", count: 1 },
    flower: { id: "flower", count: 1 },
    tulip: { id: "tulip", count: 1 },
    daisy: { id: "daisy", count: 1 },
    cloud: { id: "cloud", count: 1 },
    fence: { id: "fence", count: 1 },
    coal_ore: { id: "coal_ore", count: 1 },
    iron_ore: { id: "iron_ore", count: 1 },
    diamond_ore: { id: "diamond_ore", count: 1 },
  };
  return drops[blockId] || { id: blockId, count: 1 };
}
