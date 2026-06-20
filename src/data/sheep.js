// 50 sheep types — each with woolColor, accentColor (for cute features), meat name, rarity.
// NEW: specialAttack for certain sheep types

export const SHEEP_TYPES = [
  { id: "classic",     name: "Classic Woolly",   wool: "#FFFFFF", accent: "#FFC0CB", meat: "Lamb Chop",          rarity: "common" },
  { id: "pink",        name: "Bubblegum Sheep",  wool: "#FF9ED2", accent: "#FFFFFF", meat: "Gumball Loaf",       rarity: "common" },
  { id: "mint",        name: "Mint Sheep",       wool: "#B7F0C2", accent: "#2E8B57", meat: "Minty Meatballs",    rarity: "common" },
  { id: "lemon",       name: "Lemon Sheep",      wool: "#FFF59D", accent: "#FFB300", meat: "Zesty Zest Roll",    rarity: "common" },
  { id: "berry",       name: "Strawberry Sheep", wool: "#FF8AA1", accent: "#6B8E23", meat: "Berry Burger",       rarity: "common" },
  { id: "blueberry",   name: "Blueberry Sheep",  wool: "#7FB8FF", accent: "#1E3A8A", meat: "Blue Bake",          rarity: "common" },
  { id: "cherry",      name: "Cherry Sheep",     wool: "#FF5C7A", accent: "#7A1B2C", meat: "Cherry Chops",       rarity: "common" },
  { id: "watermelon",  name: "Watermelon Sheep", wool: "#FF8AA1", accent: "#3FBF6B", meat: "Melon Mince",        rarity: "common" },
  { id: "pumpkin",     name: "Pumpkin Sheep",    wool: "#FFA45B", accent: "#7A3A0A", meat: "Pumpkin Pie Bites",  rarity: "common" },
  { id: "donut",       name: "Donut Sheep",      wool: "#FFD8C2", accent: "#FF6FB5", meat: "Doughy Drumstick",   rarity: "common" },

  { id: "cupcake",     name: "Cupcake Sheep",    wool: "#FFCDE6", accent: "#7C3AED", meat: "Sprinkle Steak",     rarity: "common" },
  { id: "marsh",       name: "Marshmallow Sheep",wool: "#FFFFFF", accent: "#FFD1DC", meat: "Toasty Bites",       rarity: "common" },
  { id: "lolly",       name: "Lollipop Sheep",   wool: "#F472B6", accent: "#22D3EE", meat: "Candy Cutlet",       rarity: "common" },
  { id: "sun",         name: "Sunny Sheep",      wool: "#FFE066", accent: "#FF8A00", meat: "Sunny Side Up",      rarity: "common" },
  { id: "moon",        name: "Moon Sheep",       wool: "#E5E7FF", accent: "#4338CA", meat: "Lunar Loaf",         rarity: "uncommon" },
  { id: "star",        name: "Star Sheep",       wool: "#FFEB99", accent: "#FACC15", meat: "Stardust Stew",      rarity: "uncommon" },
  { id: "cloud",       name: "Cloud Sheep",      wool: "#F0F9FF", accent: "#BAE6FD", meat: "Fluff Filet",        rarity: "common" },
  { id: "snow",        name: "Snow Sheep",       wool: "#F8FAFC", accent: "#67E8F9", meat: "Snowball Stew",      rarity: "common" },
  { id: "ice",         name: "Ice Sheep",        wool: "#B5E3F5", accent: "#0EA5E9", meat: "Frosty Ribs",        rarity: "uncommon", specialAttack: { name: "Frost Bolt", damage: 3, color: "#67E8F9", range: 6 } },
  { id: "lava",        name: "Lava Sheep",       wool: "#FF6B35", accent: "#7A1D00", meat: "Spicy Sausage",      rarity: "rare", specialAttack: { name: "Fireball", damage: 5, color: "#FF6B35", range: 8 } },

  { id: "rainbow",     name: "Rainbow Sheep",    wool: "#FF8AA1", accent: "#22D3EE", meat: "Rainbow Roast",      rarity: "rare", specialAttack: { name: "Prism Beam", damage: 4, color: "#F472B6", range: 10 } },
  { id: "galaxy",      name: "Galaxy Sheep",     wool: "#4338CA", accent: "#F472B6", meat: "Cosmic Cutlet",      rarity: "rare", specialAttack: { name: "Star Blast", damage: 4, color: "#C084FC", range: 9 } },
  { id: "disco",       name: "Disco Sheep",      wool: "#C084FC", accent: "#FACC15", meat: "Funky Drumstick",    rarity: "uncommon" },
  { id: "bumblebee",   name: "Bumblebee Sheep",  wool: "#FFE066", accent: "#1F1F1F", meat: "Honey Ham",          rarity: "common" },
  { id: "panda",       name: "Panda Sheep",      wool: "#FFFFFF", accent: "#1F1F1F", meat: "Bamboo Bites",       rarity: "common" },
  { id: "tiger",       name: "Tiger Sheep",      wool: "#FFA45B", accent: "#1F1F1F", meat: "Striped Steak",      rarity: "uncommon", specialAttack: { name: "Claw Swipe", damage: 3, color: "#FFA45B", range: 5 } },
  { id: "zebra",       name: "Zebra Sheep",      wool: "#FFFFFF", accent: "#1F1F1F", meat: "Stripey Stew",       rarity: "common" },
  { id: "spotty",      name: "Spotty Sheep",     wool: "#FFFFFF", accent: "#7A3A0A", meat: "Speckled Steak",     rarity: "common" },
  { id: "blackwool",   name: "Coal Sheep",       wool: "#404552", accent: "#FFE066", meat: "Smoky Steak",        rarity: "common" },
  { id: "gold",        name: "Golden Sheep",     wool: "#FFD54A", accent: "#7A5A00", meat: "Golden Goodie",      rarity: "rare", specialAttack: { name: "Golden Shine", damage: 3, color: "#FFD54A", range: 7 } },

  { id: "silver",      name: "Silver Sheep",     wool: "#D4D7DC", accent: "#6B7280", meat: "Silver Slice",       rarity: "uncommon" },
  { id: "diamond",     name: "Diamond Sheep",    wool: "#A7F3D0", accent: "#0EA5E9", meat: "Crystal Cutlet",     rarity: "rare", specialAttack: { name: "Crystal Shard", damage: 4, color: "#A7F3D0", range: 8 } },
  { id: "emerald",     name: "Emerald Sheep",    wool: "#34D399", accent: "#065F46", meat: "Gem Goulash",        rarity: "rare", specialAttack: { name: "Emerald Burst", damage: 4, color: "#34D399", range: 8 } },
  { id: "ruby",        name: "Ruby Sheep",       wool: "#EF4444", accent: "#7F1D1D", meat: "Ruby Roast",         rarity: "rare", specialAttack: { name: "Ruby Blast", damage: 5, color: "#EF4444", range: 7 } },
  { id: "amethyst",    name: "Amethyst Sheep",   wool: "#C084FC", accent: "#5B21B6", meat: "Purple Patty",       rarity: "uncommon", specialAttack: { name: "Amethyst Wave", damage: 3, color: "#C084FC", range: 7 } },
  { id: "ocean",       name: "Ocean Sheep",      wool: "#7DD3FC", accent: "#1E40AF", meat: "Sea Sandwich",       rarity: "common" },
  { id: "beach",       name: "Beach Sheep",      wool: "#FFE4B5", accent: "#22D3EE", meat: "Tropical Taco",      rarity: "common" },
  { id: "jungle",      name: "Jungle Sheep",     wool: "#86EFAC", accent: "#7A3A0A", meat: "Banana Burger",      rarity: "common" },
  { id: "desert",      name: "Desert Sheep",     wool: "#FFD8A8", accent: "#A16207", meat: "Cactus Cutlet",      rarity: "common" },
  { id: "forest",      name: "Forest Sheep",     wool: "#4ADE80", accent: "#7A3A0A", meat: "Pine Roast",         rarity: "common" },

  { id: "knight",      name: "Knight Sheep",     wool: "#B0BEC5", accent: "#374151", meat: "Armor Plate Ham",    rarity: "uncommon", specialAttack: { name: "Shield Bash", damage: 3, color: "#B0BEC5", range: 4 } },
  { id: "wizard",      name: "Wizard Sheep",     wool: "#A78BFA", accent: "#FACC15", meat: "Magic Meatballs",    rarity: "uncommon", specialAttack: { name: "Magic Missile", damage: 4, color: "#A78BFA", range: 10 } },
  { id: "pirate",      name: "Pirate Sheep",     wool: "#9CA3AF", accent: "#7A1D00", meat: "Salty Steak",        rarity: "uncommon" },
  { id: "ninja",       name: "Ninja Sheep",      wool: "#374151", accent: "#FFEB99", meat: "Stealth Bites",      rarity: "uncommon", specialAttack: { name: "Shadow Strike", damage: 4, color: "#374151", range: 6 } },
  { id: "cowboy",      name: "Cowboy Sheep",     wool: "#D2B48C", accent: "#7A3A0A", meat: "BBQ Brisket",        rarity: "uncommon" },
  { id: "chef",        name: "Chef Sheep",       wool: "#FFFFFF", accent: "#FF6B35", meat: "Gourmet Roast",      rarity: "uncommon" },
  { id: "robot",       name: "Robot Sheep",      wool: "#C5D6E0", accent: "#22D3EE", meat: "Bolt Burger",        rarity: "rare", specialAttack: { name: "Laser Beam", damage: 4, color: "#22D3EE", range: 12 } },
  { id: "alien",       name: "Alien Sheep",      wool: "#86EFAC", accent: "#C084FC", meat: "UFO Patty",          rarity: "rare", specialAttack: { name: "Zap Beam", damage: 4, color: "#86EFAC", range: 10 } },
  { id: "dragon",      name: "Dragon Sheep",     wool: "#FF6B35", accent: "#22D3EE", meat: "Fire Wing",          rarity: "rare", specialAttack: { name: "Dragon Fire", damage: 7, color: "#FF6B35", range: 10 } },
  { id: "unicorn",     name: "Unicorn Sheep",    wool: "#FFFFFF", accent: "#F472B6", meat: "Sparkle Steak",      rarity: "legendary", specialAttack: { name: "Rainbow Beam", damage: 10, color: "#F472B6", range: 15 } },
];

export const SHEEP_BY_ID = Object.fromEntries(SHEEP_TYPES.map(s => [s.id, s]));

export const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 12, legendary: 3 };
export const RARITY_COLORS = {
  common: "#64748b",
  uncommon: "#16a34a",
  rare: "#7c3aed",
  legendary: "#f59e0b",
};

export function pickRandomSheepType() {
  const weighted = [];
  SHEEP_TYPES.forEach(s => {
    const w = RARITY_WEIGHTS[s.rarity] || 1;
    for (let i = 0; i < w; i++) weighted.push(s);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}
