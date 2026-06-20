// Passive mobs — cows, pigs, chickens, etc.
// Each has: mesh colors, speed, health, loot drops, size

export const MOB_TYPES = {
  cow: {
    id: "cow",
    name: "Cow",
    health: 10,
    speed: 0.8,
    size: { w: 1.0, h: 1.2, d: 0.6 },
    bodyColor: "#8B6B3A",
    spotColor: "#FFFFFF",
    headColor: "#8B6B3A",
    legColor: "#6B4E2A",
    eyeColor: "#1F2937",
    drops: [{ id: "meat", name: "Beef", count: 2 }],
    friendly: true,
  },
  pig: {
    id: "pig",
    name: "Pig",
    health: 8,
    speed: 1.0,
    size: { w: 0.8, h: 0.7, d: 0.5 },
    bodyColor: "#FFB0B0",
    spotColor: "#FF8080",
    headColor: "#FFB0B0",
    legColor: "#E09090",
    eyeColor: "#1F2937",
    drops: [{ id: "meat", name: "Pork", count: 1 }],
    friendly: true,
  },
  chicken: {
    id: "chicken",
    name: "Chicken",
    health: 4,
    speed: 1.4,
    size: { w: 0.4, h: 0.5, d: 0.3 },
    bodyColor: "#FFFFFF",
    spotColor: "#E0E0E0",
    headColor: "#FFFFFF",
    legColor: "#F5A623",
    eyeColor: "#1F2937",
    beakColor: "#F5A623",
    combColor: "#EF4444",
    drops: [{ id: "meat", name: "Chicken", count: 1 }],
    friendly: true,
  },
  horse: {
    id: "horse",
    name: "Horse",
    health: 15,
    speed: 1.8,
    size: { w: 1.2, h: 1.4, d: 0.5 },
    bodyColor: "#A07043",
    spotColor: "#FFFFFF",
    headColor: "#8B6B3A",
    legColor: "#6B4E2A",
    eyeColor: "#1F2937",
    maneColor: "#3A2A1A",
    drops: [{ id: "meat", name: "Steak", count: 3 }],
    friendly: true,
  },
  bunny: {
    id: "bunny",
    name: "Bunny",
    health: 3,
    speed: 2.0,
    size: { w: 0.3, h: 0.3, d: 0.25 },
    bodyColor: "#D4D4D4",
    spotColor: "#FFFFFF",
    headColor: "#D4D4D4",
    legColor: "#C0C0C0",
    eyeColor: "#FF69B4",
    drops: [],
    friendly: true,
  },
};

export const MOB_BY_ID = Object.fromEntries(Object.values(MOB_TYPES).map(m => [m.id, m]));

export function pickRandomMobType() {
  const ids = Object.keys(MOB_TYPES);
  return MOB_TYPES[ids[Math.floor(Math.random() * ids.length)]];
}
