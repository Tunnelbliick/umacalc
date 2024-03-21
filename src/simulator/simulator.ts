import Prando from 'prando';
import { Distance_proficency, Horse, Motivation, Proficiency, Style } from '../horse/horse';
import {
    Distance,
    PhaseEnum,
    race_phases,
    race_slopes,
    Track,
    TrackCondition,
} from '../track/track';
import { getDistanceModifier, getGroundTypeModifier } from '../util/horseUtil';
import { DecellSpeed, MotivationCoeficient, accelPhaseCoefficients, speedPhaseCoefficients } from './constant';
import { getForceInModifier, styleToCoefficient, trackToModifier } from './util';
/*
1-Activate skills
2-Recover HP by skills
3-Update last spurt state
4-Update target speed
5-Calculate acceleration
6-Update phase
7-Calculate distance and position
8-Check for slope
*/


export interface race_data_slice {
    frame: number;
    time: number; // time in ms
    hp: number;
    speed: number;
    position: number;
}

export interface raceData {
    slices: race_data_slice[];
    spurt?: spurtParams;
    spurtStart: number
}

export interface spurtParams {
    distance: number,
    speed: number,
    time?: number,
    hpDiff: number,
    isMaxSpurt: boolean,
    isSpurting: boolean,
}


const fixRng = false;
const frame_count = 15; // Simulate race at 15fps

export async function run_simulation(horseIn: Horse, trackIn: Track, seed: string, fullPacket: boolean = false): Promise<raceData> {

    let horse = structuredClone(horseIn)
    let track = structuredClone(trackIn)

    let rng = new Prando(seed);

    const totalHp = calculateHP(horse, track.length);
    let frameData: race_data_slice[] = [];
    let distanceCovered: number = 0;
    let currentTime: number = 0;
    let hpRemaining = totalHp;
    let currentSpeed = 3; // 3m/s is the starting speed
    let baseTargetSpeed = currentSpeed;
    let targetSpeed = currentSpeed;
    let current_phase = 0;
    let downHillMode = false;
    let currentSlope = 0;
    let section = 0;
    let sectionLenght = track.length / 24;
    let randomSectionSpeed = 0;
    let deathDistance = 0;
    let ReCalc = true;
    let spurtParams: spurtParams | undefined = undefined;
    let spurtStart = track.length;
    let outOfHp = false;

    let motivation: Motivation = horse.motivation;

    // if motivation is 6 its random motivation so generate a random motivation
    if (motivation == 6) {
        motivation = rng.next(1, 5);
    }

    horse.speed = adjustAttribute(horse.speed, MotivationCoeficient[motivation]); // TODO add additional multipliers
    horse.stamina = adjustAttribute(horse.stamina, MotivationCoeficient[motivation]);
    horse.power = adjustAttribute(horse.power, MotivationCoeficient[motivation]) + 0;
    horse.guts = adjustAttribute(horse.guts, MotivationCoeficient[motivation]);
    horse.wiz = adjustAttribute(horse.wiz, MotivationCoeficient[motivation]) * 1.0;

    let minSpeed = calcMinSpeed(horse, track);

    while (distanceCovered < track.length) {

        let currentSection = Math.floor(distanceCovered / sectionLenght);

        if (currentSection != section) {
            section = currentSection;
            randomSectionSpeed = calcRandomnessPerSection(horse, rng);
        }

        baseTargetSpeed = calcBaseTargetSpeed(horse, track, current_phase);
        let slope = checkCurrentSlopeModifier(horse, frameData.length, currentSlope, downHillMode, rng);
        downHillMode = slope.downHillMode;

        if (current_phase == 2 && ReCalc == true) {
            spurtParams = calcSpurtParameters(track, horse, distanceCovered, hpRemaining, rng);
            ReCalc = false;
        }

        if (spurtParams != undefined && spurtParams.isSpurting == false) {
            spurtParams.isSpurting = spurtParams != undefined && distanceCovered + spurtParams.distance >= track.length;
            spurtStart = spurtParams.distance == 0 ? track.length : distanceCovered;
        }

        targetSpeed = calcTargetSpeed(baseTargetSpeed, horse, slope.slopeModifier, randomSectionSpeed, spurtParams);

        if (hpRemaining < 0) {
            outOfHp = true;
            targetSpeed = minSpeed;
        }

        current_phase = getCurrentLeg(distanceCovered, track.phases);
        currentSlope = getCurrentSlope(distanceCovered, track.slopes);

        let isStartDash = checkIfStartingDash(currentSpeed, calcBaseSpeed(track), current_phase);

        let acell = calcAccel(horse, track, current_phase, currentSlope > 0, isStartDash);
        let decell = caclDecell(current_phase, false, outOfHp);
        let speedDifference = Math.abs(currentSpeed - targetSpeed);

        if (currentSpeed <= targetSpeed) {
            if (speedDifference > acell / frame_count) {
                currentSpeed += acell / frame_count;
            } else {
                currentSpeed = targetSpeed;
            }
        } else {
            if (speedDifference > Math.abs(decell / frame_count)) {
                currentSpeed += decell / frame_count;
            } else {
                currentSpeed = targetSpeed;
            }
        }


        distanceCovered += currentSpeed / frame_count;
        currentTime += 1000 / frame_count;

        let hpDrain = calculateHPDrain(currentSpeed, track, downHillMode) / frame_count

        if (current_phase == 2 || current_phase == 3) {
            hpDrain *= calcGutsModifier(horse);
        }

        hpRemaining -= hpDrain;

        if (hpRemaining <= 0 && deathDistance == 0) {
            deathDistance = distanceCovered;
        }

        let current_data = {
            frame: frameData.length + 1,
            time: Math.round(currentTime),
            hp: hpRemaining, // Example: Horse's current HP or stamina
            speed: currentSpeed,
            position: distanceCovered,
        };

        if (fullPacket == true) {
            frameData.push(current_data);
        } else if (distanceCovered >= track.length) {
            frameData.push(current_data);
        }
    }

    return { slices: frameData, spurt: spurtParams, spurtStart: spurtStart };
}

function getCurrentLeg(distance: number, phases: race_phases[]): number {
    return phases.find((p) => p.start <= distance && p.end >= distance)!.type;
}

function checkCurrentSlopeModifier(horse: Horse, currentFrame: number, currentSlope: number, downHillMode: boolean, rng: Prando): { slopeModifier: number, downHillMode: boolean } {
    let slopeModifier = 0; // Default = no change

    if (currentSlope > 0) {
        // Lower speed on uphills
        slopeModifier = -200 * Math.abs(currentSlope) / horse.power;
        downHillMode = false; // Since were running up

    } else if (currentSlope < 0) {
        // Add Frame delay so that the downhill mode isnt checked every next frame
        if (Math.floor(currentFrame * 1 / frame_count) !== Math.floor((currentFrame + 1) * 1 / frame_count)) {

            // checks if our horse can benefit from the downhill ~50% at 1200 wiz
            if (downHillMode == false && rng.next() < 0.0004 * horse.wiz) {
                downHillMode = true;

                // 20% chance that the downhill mode ends
            } else if (downHillMode && rng.next() < 0.2) {
                downHillMode = false;
            }
        }

        // Apply downhill speed depending on the decline of the downhill. steeper decline = more speed
        slopeModifier = downHillMode ? Math.abs(currentSlope) / 10 + 0.3 : 0;
    } else {
        downHillMode = false;
    }

    // global store downhillmode
    return { slopeModifier, downHillMode };
}

function getCurrentSlope(distance: number, slopes: race_slopes[]): number {

    let slope = slopes.find((s) => s.start <= distance && s.end >= distance);

    if (slope == undefined) {
        return 0;
    }

    return slope.elevation;
}

function calcRandomnessPerSection(horse: Horse, rng: Prando) {
    let max = horse.wiz / 5000 * Math.log10(horse.wiz * 0.1);
    let min = max - 0.65;

    return min + (max - min) * rng.next();
}

function checkIfStartingDash(speed: number, baseSpeed: number, leg: number) {
    if (leg == 0 && speed < (baseSpeed * 0.85))
        return true

    return false
}

function calculateHP(horse: Horse, track_lenght: number): number {
    return .8 * styleToCoefficient(horse.current_running_style) * horse.stamina + track_lenght;
}

function calcGutsModifier(horse: Horse): number {
    return 1 + (200 / Math.sqrt(600 * horse.guts));
}

function calculateHPDrain(currentSpeed: number, track: Track, downHillMode: boolean): number {
    const hpDrain = 20 * Math.pow(currentSpeed - calcBaseSpeed(track) + 12, 2) / 144.0;

    let statusModifier = 1;

    if (downHillMode) {
        statusModifier = 0.4;
    }

    return hpDrain * statusModifier * trackToModifier(track);
}

function calcBaseTargetSpeed(horse: Horse, track: Track, current_phase: number) {
    const phaseCoefficient = speedPhaseCoefficients[horse.current_running_style][current_phase];
    const distanceMod = getDistanceModifier(horse);

    if (current_phase == 2 || current_phase == 3) {
        return calcBaseSpeed(track) * phaseCoefficient + Math.sqrt(500 * horse.speed) * distanceMod * 0.002;
    } else {
        return calcBaseSpeed(track) * phaseCoefficient
    }
}

function calcLastSpurtSpeed(baseTargetSpeed: number, baseSpeed: number, horse: Horse) {
    const distanceProficiencyModifier = getDistanceModifier(horse);

    return (baseTargetSpeed + 0.01 * baseSpeed) * 1.05 + Math.sqrt(500 * horse.speed) * distanceProficiencyModifier * 0.002 + Math.pow(450 * horse.guts, 0.597) * 0.0001;
}

function calcBaseSpeed(track: Track): number {
    return 20.0 - (track.length - 2000) / 1000;
}

function calcTargetSpeed(baseTargetSpeed: number, horse: Horse, slopeModifier: number, randomSectionSpeed: number, spurtParams: spurtParams | undefined): number {
    let forceInModifier = getForceInModifier(horse);
    let skillModifier = 0;

    let targetSpeed = (spurtParams != undefined && spurtParams.isSpurting ? spurtParams.speed : baseTargetSpeed) + forceInModifier + skillModifier + slopeModifier;

    if (spurtParams != undefined && spurtParams.isSpurting == false) {
        targetSpeed = targetSpeed + targetSpeed / 100 * randomSectionSpeed;
    }

    return targetSpeed;
}

function calcSpurtParameters(track: Track, horse: Horse, distanceCovered: number, hpRemaining: number, rng: Prando): spurtParams {

    const baseTargetSpeed = calcBaseTargetSpeed(horse, track, 2);
    const lastSpurtSpeed = calcLastSpurtSpeed(baseTargetSpeed, calcBaseSpeed(track), horse);

    const maxDistance = track.length - distanceCovered;
    const spurtDistance = calcSpurtDistance(lastSpurtSpeed, baseTargetSpeed, horse, track, distanceCovered, hpRemaining);
    const stamUsedForSpurt = calcRequiredHp(lastSpurtSpeed, baseTargetSpeed, horse, track, distanceCovered);

    if (spurtDistance >= maxDistance) {
        return {
            distance: maxDistance,
            speed: lastSpurtSpeed,
            hpDiff: hpRemaining - stamUsedForSpurt,
            isSpurting: false,
            isMaxSpurt: true,
        }
    }

    const candidates: spurtParams[] = [];
    const totalUsedMinSpeed = calcRequiredHp(baseTargetSpeed, baseTargetSpeed, horse, track, distanceCovered);
    const excessHp = hpRemaining - totalUsedMinSpeed;

    if (excessHp < 0) {
        return {
            distance: 0,
            speed: baseTargetSpeed,
            hpDiff: hpRemaining - stamUsedForSpurt,
            isSpurting: false,
            isMaxSpurt: false,
        }
    }

    for (let speed = lastSpurtSpeed - 0.1; speed >= baseTargetSpeed; speed -= 0.1) {

        let distanceForSpeed = calcSpurtDistance(speed, baseTargetSpeed, horse, track, distanceCovered, hpRemaining);
        if (distanceForSpeed >= maxDistance) {
            distanceForSpeed = maxDistance;
        }

        candidates.push({
            distance: distanceForSpeed,
            speed: speed,
            time: distanceForSpeed / speed + (maxDistance - distanceForSpeed) / baseTargetSpeed,
            hpDiff: hpRemaining - stamUsedForSpurt,
            isSpurting: false,
            isMaxSpurt: false,
        })
    }

    candidates.sort((a, b) => a.time! - b.time!);

    for (const canidate of candidates) {

        if (fixRng) {
            return canidate;
        }

        if (rng.next() * 100 < 15 + 0.05 * horse.wiz) {
            return canidate;
        }

    }

    return candidates[candidates.length - 1];

}

function calcMinSpeed(horse: Horse, track: Track) {
    return 0.85 * calcBaseSpeed(track) + Math.sqrt(200 * horse.guts) * 0.001;
}

function calcSpurtDistance(LastSpurtSpeed: number, baseTargetSpeed: number, horse: Horse, track: Track, currentDistance: number, currentHp: number) {

    // Calculates the length that can be sprinted using the remaining hp.
    return (
        (currentHp -
            ((track.length - currentDistance - 60) *
                20 *
                trackToModifier(track) *
                calcGutsModifier(horse) *
                Math.pow(baseTargetSpeed - calcBaseSpeed(track) + 12, 2)) /
            144 /
            baseTargetSpeed) /
        (20 *
            trackToModifier(track) *
            calcGutsModifier(horse) *
            (Math.pow(LastSpurtSpeed - calcBaseSpeed(track) + 12, 2) / 144 / LastSpurtSpeed -
                Math.pow(baseTargetSpeed - calcBaseSpeed(track) + 12, 2) / 144 / baseTargetSpeed)) +
        60
    );

}

function calcRequiredHp(lastSpurtSpeed: number, baseTargetSpeed: number, horse: Horse, track: Track, currentDistance: number) {

    return (
        ((track.length - currentDistance - 60) *
            20 *
            trackToModifier(track) *
            calcGutsModifier(horse) *
            Math.pow(baseTargetSpeed - calcBaseSpeed(track) + 12, 2)) /
        144 /
        baseTargetSpeed +
        (track.length - currentDistance - 60) *
        (20 *
            trackToModifier(track) *
            calcGutsModifier(horse) *
            (Math.pow(lastSpurtSpeed - calcBaseSpeed(track) + 12, 2) / 144 / lastSpurtSpeed -
                Math.pow(baseTargetSpeed - calcBaseSpeed(track) + 12, 2) / 144 / baseTargetSpeed))
    );
}

function calcAccel(horse: Horse, track: Track, current_phase: number, isOnSlope: boolean, isStartDash: boolean) {
    const baseAccel = isOnSlope ? 0.0004 : 0.0006
    const phaseCoefficient = accelPhaseCoefficients[horse.current_running_style][current_phase];
    const groundTypeModifier = getGroundTypeModifier(horse, track);
    const startDashModifier = isStartDash ? 24 : 0;

    let acell = baseAccel * Math.sqrt(500 * horse.power) * phaseCoefficient * groundTypeModifier * 1 + startDashModifier;

    return acell;
}

function clamp(input: number, min: number, max: number) {
    return Math.min(Math.max(input, min), max);
}

function adjustAttribute(attribute: number, motivationCoefficient: number) {
    // Step 1: Halve the attribute if it's greater than 1200
    if (attribute > 1200) {
        attribute = 1200 + (attribute - 1200) / 2;
    }

    // Step 2: Apply the motivation coefficient
    attribute = attribute * motivationCoefficient;

    // Step 3: Clamp the value between 1 and 2000
    attribute = Math.max(1, Math.min(attribute, 2000));

    return attribute;
}

function caclDecell(leg: number, hasPaceDown: boolean, outOfHp: boolean) {
    if (outOfHp)
        return DecellSpeed.hp;
    if (hasPaceDown)
        return DecellSpeed.pace;

    switch (leg) {
        case PhaseEnum.OpeningLeg:
            return DecellSpeed.opening;
        case PhaseEnum.MiddleLeg:
            return DecellSpeed.middle;
        default:
            return DecellSpeed.final;
    }

}
