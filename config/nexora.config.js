// nexora.config.js - Region and ritual configuration

const config = {
  regions: {
    punjab_village: {
      label: "Punjab Village",
      lowInternetMode: true,
      ritualDuration: 60,
      milestones: [10, 30, 60],
      npcStyle: "elder",
    },
    punjabi_nri: {
      label: "Punjabi NRI",
      lowInternetMode: false,
      ritualDuration: 60,
      milestones: [5, 10, 20, 30, 45],
      npcStyle: "coach",
    },
    other: {
      label: "Global",
      lowInternetMode: false,
      ritualDuration: 60,
      milestones: [5, 10, 20, 30, 45],
      npcStyle: "sensei",
    },
  },
  defaults: {
    lowInternetMode: false,
    ritualDuration: 60,
    milestones: [5, 10, 20, 30, 45],
  },
  belts: ["White", "Yellow", "Green", "Blue", "Purple", "Black", "Gold"],
  shieldMax: 100,
};

if (typeof module !== "undefined") module.exports = config;
if (typeof window !== "undefined") window.__NEXORA_CONFIG = config;
