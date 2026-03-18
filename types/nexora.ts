// nexora.ts - Type definitions for NeXora Ritual Engine

export interface NexoraRegionConfig {
  label: string;
  lowInternetMode: boolean;
  ritualDuration: number;
  milestones: number[];
  npcStyle: "elder" | "coach" | "sensei";
}

export interface NexoraConfig {
  regions: Record<string, NexoraRegionConfig>;
  defaults: {
    lowInternetMode: boolean;
    ritualDuration: number;
    milestones: number[];
  };
  belts: string[];
  shieldMax: number;
}

export interface NexoraAsset {
  id: string;
  type: "npc" | "hud" | "sound" | "badge";
  url: string;
  region?: string;
}

export interface NexoraUserProfile {
  userId: string;
  belt: string;
  shield: number;
  streak: number;
  totalRituals: number;
  lastRitualAt: string;
  region: string;
}

export interface PromptResponse {
  npcText: string;
  sessionId: string;
  lowInternetMode: boolean;
}

export interface LogEvent {
  userId: string;
  eventType: "ritual_start" | "milestone" | "ritual_complete" | "jump" | "coin" | "checkpoint";
  timestamp: number;
  sessionId?: string;
  elapsed?: number;
  data?: Record<string, unknown>;
}

export interface StatsResponse {
  shieldDelta: number;
  streak: number;
  belt: string;
}
