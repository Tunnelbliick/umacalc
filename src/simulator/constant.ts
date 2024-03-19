import { Motivation, Style } from "../horse/horse";
import { PhaseEnum } from "../track/track";

export const speedPhaseCoefficients: any = {
    [Style.runner]: {
        [PhaseEnum.OpeningLeg]: 1.0,
        [PhaseEnum.MiddleLeg]: 0.98,
        [PhaseEnum.FinalLeg]: 0.962,
        [PhaseEnum.LastSpurt]: 0.962, // Assuming it's the same as Final Leg if not specified
    },
    [Style.leader]: {
        [PhaseEnum.OpeningLeg]: 0.978,
        [PhaseEnum.MiddleLeg]: 0.991,
        [PhaseEnum.FinalLeg]: 0.975,
        [PhaseEnum.LastSpurt]: 0.975, // Assuming it's the same as Final Leg if not specified
    },
    [Style.betweener]: {
        [PhaseEnum.OpeningLeg]: 0.938,
        [PhaseEnum.MiddleLeg]: 0.998,
        [PhaseEnum.FinalLeg]: 0.994,
        [PhaseEnum.LastSpurt]: 0.994, // Assuming it's the same as Final Leg if not specified
    },
    [Style.chaser]: {
        [PhaseEnum.OpeningLeg]: 0.931,
        [PhaseEnum.MiddleLeg]: 1,
        [PhaseEnum.FinalLeg]: 1,
        [PhaseEnum.LastSpurt]: 1, // Assuming it's the same as Final Leg if not specified
    },
    [Style.oonige]: {
        [PhaseEnum.OpeningLeg]: 1.063,
        [PhaseEnum.MiddleLeg]: 0.962,
        [PhaseEnum.FinalLeg]: 0.95,
        [PhaseEnum.LastSpurt]: 0.95, // Assuming it's the same as Final Leg if not specified
    },
};

export const accelPhaseCoefficients: any = {
    [Style.runner]: {
        [PhaseEnum.OpeningLeg]: 1.0,
        [PhaseEnum.MiddleLeg]: 1.0,
        [PhaseEnum.FinalLeg]: 0.996,
        [PhaseEnum.LastSpurt]: 0.996, // Assuming it's the same as Final Leg if not specified
    },
    [Style.leader]: {
        [PhaseEnum.OpeningLeg]: 0.985,
        [PhaseEnum.MiddleLeg]: 1,
        [PhaseEnum.FinalLeg]: 0.996,
        [PhaseEnum.LastSpurt]: 0.996, // Assuming it's the same as Final Leg if not specified
    },
    [Style.betweener]: {
        [PhaseEnum.OpeningLeg]: 0.975,
        [PhaseEnum.MiddleLeg]: 1,
        [PhaseEnum.FinalLeg]: 1,
        [PhaseEnum.LastSpurt]: 1, // Assuming it's the same as Final Leg if not specified
    },
    [Style.chaser]: {
        [PhaseEnum.OpeningLeg]: 0.945,
        [PhaseEnum.MiddleLeg]: 1,
        [PhaseEnum.FinalLeg]: 0.997,
        [PhaseEnum.LastSpurt]: 0.997, // Assuming it's the same as Final Leg if not specified
    },
    [Style.oonige]: {
        [PhaseEnum.OpeningLeg]: 1.17,
        [PhaseEnum.MiddleLeg]: 0.94,
        [PhaseEnum.FinalLeg]: 0.956,
        [PhaseEnum.LastSpurt]: 0.956, // Assuming it's the same as Final Leg if not specified
    },
};

export const StrategyCoefficient = {
    runner: 0.95,
    leader: 0.89,
    betweener: 1,
    chaser: 0.995,
    oonige: 0.86,
};

export const StatusModifierTurf = {
    good: 1,
    yielding: 1,
    soft: 1.02,
    heavy: 1.02,
};

export const StatusModifierDirt = {
    good: 1,
    yielding: 1,
    soft: 1.01,
    heavy: 1.02,
};

export const DecellSpeed = {
    opening: -1.2,
    middle: -0.8,
    final: -1.0,
    pace: -0.5,
    hp: -1.2
}

export const FoceInModifier = {
    chaser: 0.03,
    betweener: 0.01,
    leader: 0.01,
    runner: 0.02
}

export const MotivationCoeficient: { [key in Motivation]: number } = {
    [Motivation.Best]: 1.04,
    [Motivation.Good]: 1.02,
    [Motivation.Normal]: 1,
    [Motivation.Bad]: 0.98,
    [Motivation.Worst]: 0.96,
    [Motivation.Random]: 0
}