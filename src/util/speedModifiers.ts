import { Proficiency } from "../horse/horse";

export const distanceModifier = {
    [Proficiency.G]: 0.1,
    [Proficiency.F]: 0.2,
    [Proficiency.E]: 0.4,
    [Proficiency.D]: 0.6,
    [Proficiency.C]: 0.8,
    [Proficiency.B]: 0.9,
    [Proficiency.A]: 1.0,
    [Proficiency.S]: 1.05,
  };