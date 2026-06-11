export interface TrainerMon {
  creatureId: string;
  level: number;
}

export type NpcRole = 'generic' | 'nurse' | 'clerk' | 'trainer_m' | 'trainer_f' | 'rival' | 'leader' | 'prof' | 'sign' | 'chest';

export interface MapNpc {
  id: string;
  x: number;
  y: number;
  name: string;
  role?: NpcRole;
  lines: string[];
  trainer?: {
    party: TrainerMon[];
    reward: number;
    badge?: string;
  };
  rematch?: { party: TrainerMon[]; reward: number };
  gate?: { requiresBadge?: string; requiresFlag?: string; blockLines: string[] };
}

export type MapTheme = 'heal' | 'mart' | 'lab' | 'outdoor';

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[];
  spawn: { x: number; y: number };
  warps: { x: number; y: number; toMap: string; toX: number; toY: number; requiresBadge?: string; requiresFlag?: string }[];
  npcs: MapNpc[];
  encounterRate: number;
  encounterTable?: string;
  music?: string;
  mapTheme?: MapTheme;
}
