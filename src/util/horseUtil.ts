import { Horse, Proficiency } from '../horse/horse';
import { Distance, RaceSurface, Track } from '../track/track';
import { distanceModifier } from './speedModifiers';

export function getDistanceModifier(horse: Horse,): number {
  return getModifierForProficiency(horse.distance);
}

export function getGroundTypeModifier(horse: Horse, track: Track): number {
  return getModifierForProficiency(horse.ground);
}

export function getModifierForProficiency(proficiency: Proficiency): number {
  switch (proficiency) {
    case Proficiency.G:
      return distanceModifier[Proficiency.G];
    case Proficiency.F:
      return distanceModifier[Proficiency.F];
    case Proficiency.E:
      return distanceModifier[Proficiency.E];
    case Proficiency.D:
      return distanceModifier[Proficiency.D];
    case Proficiency.C:
      return distanceModifier[Proficiency.C];
    case Proficiency.B:
      return distanceModifier[Proficiency.B];
    case Proficiency.A:
      return distanceModifier[Proficiency.A];
    case Proficiency.S:
      return distanceModifier[Proficiency.S];
  }
}
