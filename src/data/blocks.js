// Block palette — bright, playful colors for a kid-friendly voxel world.
export const BLOCK_TYPES = {
  grass:  { id: "grass",  name: "Grass",  color: "#5fbf3a", topColor: "#7AD64F", icon: "grass" },
  dirt:   { id: "dirt",   name: "Dirt",   color: "#8B5A2B", icon: "dirt" },
  stone:  { id: "stone",  name: "Stone",  color: "#9aa3ad", icon: "stone" },
  sand:   { id: "sand",   name: "Sand",   color: "#F5E2A5", icon: "sand" },
  wood:   { id: "wood",   name: "Wood",   color: "#A07043", icon: "wood" },
  leaves: { id: "leaves", name: "Leaves", color: "#4ADE80", icon: "leaves" },
  flower: { id: "flower", name: "Flower", color: "#FB7185", icon: "flower" },
  brick:  { id: "brick",  name: "Brick",  color: "#E07A5F", icon: "brick" },
  cloud:  { id: "cloud",  name: "Cloud",  color: "#FFFFFF", icon: "cloud" },
  fence:  { id: "fence",  name: "Fence",  color: "#C4884D", icon: "fence" },
};

export const HOTBAR_DEFAULT = [
  { type: "tool",  id: "catcher", name: "Sheep Catcher" },
  { type: "block", id: "grass" },
  { type: "block", id: "dirt" },
  { type: "block", id: "stone" },
  { type: "block", id: "sand" },
  { type: "block", id: "wood" },
  { type: "block", id: "leaves" },
  { type: "block", id: "brick" },
  { type: "block", id: "fence" },
  { type: "block", id: "cloud" },
];
