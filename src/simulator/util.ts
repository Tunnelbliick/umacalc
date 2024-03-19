import { Horse, Style } from "../horse/horse";
import { Track, TrackCondition } from "../track/track";
import { FoceInModifier, StatusModifierDirt, StatusModifierTurf, StrategyCoefficient } from "./constant";

export function styleToCoefficient(style: Style): number {
    switch (style) {
        case Style.chaser:
            return StrategyCoefficient.chaser;
        case Style.betweener:
            return StrategyCoefficient.betweener;
        case Style.leader:
            return StrategyCoefficient.leader;
        case Style.runner:
            return StrategyCoefficient.runner;
        case Style.oonige:
            return StrategyCoefficient.oonige;
        default:
            return StrategyCoefficient.leader;
    }
}

export function getForceInModifier(horse: Horse): number {

    switch (horse.current_running_style) {
        case Style.chaser:
            return FoceInModifier.chaser;
        case Style.betweener:
            return FoceInModifier.betweener;
        case Style.leader:
            return FoceInModifier.leader;
        case Style.runner:
            return FoceInModifier.runner;
        default:
            return FoceInModifier.leader;
    }

}

export function trackToModifier(track: Track): number {
    switch (track.condition) {
        case TrackCondition.Good:
            return track.surface == 1
                ? StatusModifierTurf.good
                : StatusModifierDirt.good;
        case TrackCondition.Yielding:
            return track.surface == 1
                ? StatusModifierTurf.yielding
                : StatusModifierDirt.yielding;
        case TrackCondition.Soft:
            return track.surface == 1
                ? StatusModifierTurf.soft
                : StatusModifierDirt.soft;
        case TrackCondition.Heavy:
            return track.surface == 1
                ? StatusModifierTurf.heavy
                : StatusModifierDirt.heavy;
        default:
            return track.surface == 1
                ? StatusModifierTurf.good
                : StatusModifierDirt.good;
    }
}