import { skill } from '../skill/skill';

export interface Horse {
  chard_id: number;
  character_id: number;
  speed: number;
  stamina: number;
  power: number;
  wiz: number;
  guts: number;
  fans: number;
  ground: Proficiency;
  style: Proficiency;
  distance: Proficiency;
  skills: skill[];
  current_running_style: Style;
  motivation: Motivation
}

export enum Motivation {
  Best = 1,
  Good = 2,
  Normal = 3,
  Bad = 4,
  Worst = 5,
  Random = 6,
}

export enum Proficiency {
  G = 1,
  F = 2,
  E = 3,
  D = 4,
  C = 5,
  B = 6,
  A = 7,
  S = 8,
}

export enum Style {
  chaser = 1,
  betweener = 2,
  leader = 3,
  runner = 4,
  oonige = 5,
}

export interface Ground_proficency {
  dirt: Proficiency;
  turf: Proficiency;
}

export interface Style_proficency {
  runner: Proficiency;
  leader: Proficiency;
  between: Proficiency;
  chaser: Proficiency;
  oonige: Proficiency;
}

export interface Distance_proficency {
  short: Proficiency;
  mile: Proficiency;
  medium: Proficiency;
  long: Proficiency;
}
