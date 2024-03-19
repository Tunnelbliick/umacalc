export interface Track {
  location: string,
  length: number;
  phases: race_phases[];
  corners: race_corners[];
  slopes: race_slopes[];
  straights: race_straights[];
  other: race_other;
  surface: RaceSurface;
  condition: TrackCondition;
  inout: string;
  distance: Distance;
}


export enum LocationEnum {
  "Sapporo" = 0,
  "Hakodate" = 1,
  "Niigata" = 2,
  "Fukushima" = 3,
  "Nakayama" = 4,
  "Tokyo" = 5,
  "Chukyo" = 6,
  "Kyoto" = 7,
  "Hanshin" = 8,
  "Kokura" = 9,
  "Ooi" = 10,
  "Kawasaki" = 11,
  "Funabashi" = 12,
  "Morioka" = 13,
  "Longchamp" = 14,
  Moogata
}

export interface Location {
  name: string,
  jp?: string,
  internal: LocationEnum,
}

export enum Distance {
  short = 0,
  mile = 1,
  medium = 2,
  long = 3,
}

export enum RaceSurface {
  Turf = 0,
  Dirt = 1,
}

export enum PhaseEnum {
  OpeningLeg = 0,
  MiddleLeg = 1,
  FinalLeg = 2,
  LastSpurt = 3,
}

export enum TrackCondition {
  Good = 0,
  Yielding = 1,
  Soft = 2,
  Heavy = 3,
  Random = 4,
}

export interface race_phases {
  start: number;
  end: number;
  type: PhaseEnum;
}

export interface race_corners {
  start: number;
  end: number;
}

export interface race_slopes {
  start: number;
  end: number;
  elevation: number;
}

export interface race_straights {
  start: number;
  end: number;
}

export interface race_other {
  keep: race_keep;
  spurt: race_spurt;
  threshold: string[]
}

export interface race_keep {
  start: number;
  end: number;
}

export interface race_spurt {
  start: number;
}
