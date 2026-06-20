// Villager types — friendly NPCs that live in villages
export const VILLAGER_TYPES = {
  farmer: {
    id: "farmer",
    name: "Farmer",
    shirtColor: "#8B6B3A",
    pantsColor: "#4A3728",
    hatColor: "#C4A053",
    greeting: "Welcome to our village!",
  },
  librarian: {
    id: "librarian",
    name: "Librarian",
    shirtColor: "#E8EAEC",
    pantsColor: "#6B7280",
    hatColor: "#FFFFFF",
    greeting: "Have you read a good book lately?",
  },
  blacksmith: {
    id: "blacksmith",
    name: "Blacksmith",
    shirtColor: "#5A5A5A",
    pantsColor: "#3A3A3A",
    hatColor: "#5A5A5A",
    greeting: "Need any tools forged?",
  },
  baker: {
    id: "baker",
    name: "Baker",
    shirtColor: "#FFFFFF",
    pantsColor: "#8B6B3A",
    hatColor: "#FFFFFF",
    greeting: "Fresh bread coming right up!",
  },
  shepherd: {
    id: "shepherd",
    name: "Shepherd",
    shirtColor: "#4ADE80",
    pantsColor: "#8B6B3A",
    hatColor: "#4ADE80",
    greeting: "The sheep are looking lovely today!",
  },
};

export function pickRandomVillagerType() {
  const ids = Object.keys(VILLAGER_TYPES);
  return VILLAGER_TYPES[ids[Math.floor(Math.random() * ids.length)]];
}
