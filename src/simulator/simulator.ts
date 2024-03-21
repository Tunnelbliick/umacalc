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

export class Simulator {

    frame_count = 15; // Simulate race at 15fps
    static StatusModifierTurf: any;

    async run_simulation(horseIn: Horse, trackIn: Track, fullPacket: boolean = false): Promise<raceData> {

        let horse = structuredClone(horseIn)
        let track = structuredClone(trackIn)

        const totalHp = this.calculateHP(horse, track.length);
        let frameData: race_data_slice[] = [];
        let distanceCovered: number = 0;
        let currentTime: number = 0;
        let hpRemaining = totalHp;
        let currentSpeed = 3; // 3m/s is the starting speed
        let baseTargetSpeed = currentSpeed;
        let lastSpurtSpeed = currentSpeed;
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
            motivation = Math.floor(Math.random() * 5) + 1;
        }

        horse.speed = this.adjustAttribute(horse.speed, MotivationCoeficient[motivation]); // TODO add additional multipliers
        horse.stamina = this.adjustAttribute(horse.stamina, MotivationCoeficient[motivation]);
        horse.power = this.adjustAttribute(horse.power, MotivationCoeficient[motivation]) + 0;
        horse.guts = this.adjustAttribute(horse.guts, MotivationCoeficient[motivation]);
        horse.wiz = this.adjustAttribute(horse.wiz, MotivationCoeficient[motivation]) * 1.0;

        let minSpeed = this.calcMinSpeed(horse, track);

        while (distanceCovered < track.length) {

            let currentSection = Math.floor(distanceCovered / sectionLenght);

            if (currentSection != section) {
                section = currentSection;
                randomSectionSpeed = this.calcRandomnessPerSection(horse);
            }

            baseTargetSpeed = this.calcBaseTargetSpeed(horse, track, current_phase);
            let slope = this.checkCurrentSlopeModifier(horse, frameData.length, currentSlope, downHillMode);
            downHillMode = slope.downHillMode;

            if (current_phase == 2 && ReCalc == true) {
                spurtParams = this.calcSpurtParameters(track, horse, distanceCovered, lastSpurtSpeed, baseTargetSpeed, hpRemaining);
                ReCalc = false;
            }

            if(spurtParams != undefined && spurtParams.isSpurting == false) {
                spurtParams.isSpurting = spurtParams != undefined && distanceCovered + spurtParams.distance >= track.length;
                spurtStart = distanceCovered;
            }

            targetSpeed = this.calcTargetSpeed(baseTargetSpeed, lastSpurtSpeed, horse, slope.slopeModifier, randomSectionSpeed, spurtParams);

            if(hpRemaining < 0) {
                outOfHp = true;
                targetSpeed = minSpeed;
            }

            lastSpurtSpeed = this.calcLastSpurtSpeed(baseTargetSpeed, this.calcBaseSpeed(track), horse);
            current_phase = this.getCurrentLeg(distanceCovered, track.phases);
            currentSlope = this.getCurrentSlope(distanceCovered, track.slopes);

            let isStartDash = this.checkIfStartingDash(currentSpeed, this.calcBaseSpeed(track), current_phase);

            let acell = this.calcAccel(horse, track, current_phase, currentSlope > 0, isStartDash);
            let decell = this.caclDecell(current_phase, false, outOfHp);
            let speedDifference = Math.abs(currentSpeed - targetSpeed);

            if (currentSpeed <= targetSpeed) {
                if (speedDifference > acell / this.frame_count) {
                    currentSpeed += acell / this.frame_count;
                } else {
                    currentSpeed = targetSpeed;
                }
            } else {
                if (speedDifference > Math.abs(decell / this.frame_count)) {
                    currentSpeed += decell / this.frame_count;
                } else {
                    currentSpeed = targetSpeed;
                }
            }


            distanceCovered += currentSpeed / this.frame_count;
            currentTime += 1000 / this.frame_count;

            let hpDrain = this.calculateHPDrain(currentSpeed, track, downHillMode) / this.frame_count

            if (current_phase == 2 || current_phase == 3) {
                hpDrain *= this.calcGutsModifier(horse);
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

        return {slices:frameData, spurt:spurtParams, spurtStart: spurtStart};
    }

    getCurrentLeg(distance: number, phases: race_phases[]): number {
        return phases.find((p) => p.start <= distance && p.end >= distance)!.type;
    }

    checkCurrentSlopeModifier(horse: Horse, currentFrame: number, currentSlope: number, downHillMode: boolean): { slopeModifier: number, downHillMode: boolean } {
        let slopeModifier = 0; // Default = no change

        if (currentSlope > 0) {
            // Lower speed on uphills
            slopeModifier = -200 * Math.abs(currentSlope) / horse.power;
            downHillMode = false; // Since were running up

        } else if (currentSlope < 0) {
            // Add Frame delay so that the downhill mode isnt checked every next frame
            if (Math.floor(currentFrame * 1 / this.frame_count) !== Math.floor((currentFrame + 1) * 1 / this.frame_count)) {

                // checks if our horse can benefit from the downhill ~50% at 1200 wiz
                if (downHillMode == false && Math.random() < 0.0004 * horse.wiz) {
                    downHillMode = true;

                    // 20% chance that the downhill mode ends
                } else if (downHillMode && Math.random() < 0.2) {
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

    getCurrentSlope(distance: number, slopes: race_slopes[]): number {

        let slope = slopes.find((s) => s.start <= distance && s.end >= distance);

        if (slope == undefined) {
            return 0;
        }

        return slope.elevation;
    }

    calcRandomnessPerSection(horse: Horse) {
        let max = horse.wiz / 5000 * Math.log10(horse.wiz * 0.1);
        let min = max - 0.65;

        return min + (max - min) * Math.random();
    }

    checkIfStartingDash(speed: number, baseSpeed: number, leg: number) {
        if (leg == 0 && speed < (baseSpeed * 0.85))
            return true

        return false
    }

    calculateHP(horse: Horse, track_lenght: number): number {
        return .8 * styleToCoefficient(horse.current_running_style) * horse.stamina + track_lenght;
    }

    calcGutsModifier(horse: Horse): number {
        return 1 + (200 / Math.sqrt(600 * horse.guts));
    }

    calculateHPDrain(currentSpeed: number, track: Track, downHillMode: boolean): number {
        const hpDrain = 20 * Math.pow(currentSpeed - this.calcBaseSpeed(track) + 12, 2) / 144.0;

        let statusModifier = 1;

        if (downHillMode) {
            statusModifier = 0.4;
        }

        return hpDrain * statusModifier * trackToModifier(track);
    }

    calcBaseTargetSpeed(horse: Horse, track: Track, current_phase: number) {
        const phaseCoefficient = speedPhaseCoefficients[horse.current_running_style][current_phase];
        const distanceMod = getDistanceModifier(horse);

        if (current_phase == 2 || current_phase == 3) {
            return this.calcBaseSpeed(track) * phaseCoefficient + Math.sqrt(500 * horse.speed) * distanceMod * 0.002;
        } else {
            return this.calcBaseSpeed(track) * phaseCoefficient
        }
    }

    calcLastSpurtSpeed(baseTargetSpeed: number, baseSpeed: number, horse: Horse) {
        const distanceProficiencyModifier = getDistanceModifier(horse);

        return (baseTargetSpeed + 0.01 * baseSpeed) * 1.05 + Math.sqrt(500 * horse.speed) * distanceProficiencyModifier * 0.002 + Math.pow(450 * horse.guts, 0.597) * 0.0001;
    }

    calcBaseSpeed(track: Track): number {
        return 20.0 - (track.length - 2000) / 1000;
    }

    calcTargetSpeed(baseTargetSpeed: number, LastSpurtSpeed: number, horse: Horse, slopeModifier: number, randomSectionSpeed: number, spurtParams: spurtParams | undefined): number {
        let forceInModifier = getForceInModifier(horse);
        let skillModifier = 0;

        let targetSpeed = (spurtParams != undefined && spurtParams.isSpurting ? spurtParams.speed : baseTargetSpeed) + forceInModifier + skillModifier + slopeModifier;

        if (spurtParams != undefined && spurtParams.isSpurting == false) {
            targetSpeed = targetSpeed + targetSpeed / 100 * randomSectionSpeed;
        }

        return targetSpeed;
    }

    calcSpurtParameters(track: Track, horse: Horse, distanceCovered: number, lastSpurtSpeed: number, baseTargetSpeed: number, hpRemaining: number): spurtParams {
        const maxDistance = track.length - distanceCovered;
        const spurtDistance = this.calcSpurtDistance(lastSpurtSpeed, baseTargetSpeed, horse, track, distanceCovered, hpRemaining);
        const stamUsedForSpurt = this.calcRequiredHp(lastSpurtSpeed, baseTargetSpeed, horse, track, distanceCovered);

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
        const totalUsedMinSpeed = this.calcRequiredHp(baseTargetSpeed, baseTargetSpeed, horse, track, distanceCovered);
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

            let distanceForSpeed = this.calcSpurtDistance(speed, baseTargetSpeed, horse, track, distanceCovered, hpRemaining);
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

            if (Math.random() * 100 < 15 + 0.05 * horse.wiz) {
                return canidate;
            }

        }

        return candidates[candidates.length - 1];

    }

    calcMinSpeed(horse: Horse, track: Track) {
        return 0.85 * this.calcBaseSpeed(track) + Math.sqrt(200 * horse.guts) * 0.001;
    }

    calcSpurtDistance(LastSpurtSpeed: number, baseTargetSpeed: number, horse: Horse, track: Track, currentDistance: number, currentHp: number) {

        // Calculates the length that can be sprinted using the remaining hp.
        return (
            (currentHp -
                ((track.length - currentDistance - 60) *
                    20 *
                    trackToModifier(track) *
                    this.calcGutsModifier(horse) *
                    Math.pow(baseTargetSpeed - this.calcBaseSpeed(track) + 12, 2)) /
                144 /
                baseTargetSpeed) /
            (20 *
                trackToModifier(track) *
                this.calcGutsModifier(horse) *
                (Math.pow(LastSpurtSpeed - this.calcBaseSpeed(track) + 12, 2) / 144 / LastSpurtSpeed -
                    Math.pow(baseTargetSpeed - this.calcBaseSpeed(track) + 12, 2) / 144 / baseTargetSpeed)) +
            60
        );

    }

    calcRequiredHp(lastSpurtSpeed: number, baseTargetSpeed: number, horse: Horse, track: Track, currentDistance: number) {

        return (
            ((track.length - currentDistance - 60) *
                20 *
                trackToModifier(track) *
                this.calcGutsModifier(horse) *
                Math.pow(baseTargetSpeed - this.calcBaseSpeed(track) + 12, 2)) /
            144 /
            baseTargetSpeed +
            (track.length - currentDistance - 60) *
            (20 *
                trackToModifier(track) *
                this.calcGutsModifier(horse) *
                (Math.pow(lastSpurtSpeed - this.calcBaseSpeed(track) + 12, 2) / 144 / lastSpurtSpeed -
                    Math.pow(baseTargetSpeed - this.calcBaseSpeed(track) + 12, 2) / 144 / baseTargetSpeed))
        );
    }

    calcAccel(horse: Horse, track: Track, current_phase: number, isOnSlope: boolean, isStartDash: boolean) {
        const baseAccel = isOnSlope ? 0.0004 : 0.0006
        const phaseCoefficient = accelPhaseCoefficients[horse.current_running_style][current_phase];
        const groundTypeModifier = getGroundTypeModifier(horse, track);
        const startDashModifier = isStartDash ? 24 : 0;

        let acell = baseAccel * Math.sqrt(500 * horse.power) * phaseCoefficient * groundTypeModifier * 1 + startDashModifier;

        return acell;
    }

    clamp(input: number, min: number, max: number) {
        return Math.min(Math.max(input, min), max);
    }

    adjustAttribute(attribute: number, motivationCoefficient: number) {
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

    caclDecell(leg: number, hasPaceDown: boolean, outOfHp: boolean) {
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
}
