/*
seed -
t = location Enum
l = track length
o = track sruface
r = speed
s = stamina
p = power
g = gutz
w = wizdom
m = motivation
c = current strategy
g = ground proficency enum
d = distance proficency
y = style proficency
k = skills as [id:level]
*/

import { Horse } from "../horse/horse";
import { Location, LocationEnum, Track } from "../track/track";
import LZString from 'lz-string';

export function encodeSettings(horse: Horse, location: Location, track: Track, seed: string) {

    const input = `${seed}-t${location.internal}l${track.length}o${track.surface}r${horse.speed}s${horse.stamina}p${horse.power}g${horse.guts}w${horse.wiz}m${horse.motivation}c${horse.current_running_style}g${horse.ground}d${horse.distance}y${horse.style}k99999:18888:7:44444:1`;

    console.log(input);

    const compress = LZString.compressToEncodedURIComponent(input);

    console.log(compress);

    const decode = decodeSettings(compress);

    console.log(decode);

    return compress
}

export function decodeSettings(compressedString: string) {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressedString);

    if (!decompressed) {
        throw new Error("Decompression failed. The string might be corrupted or invalid.");
    }

    // Split the decompressed string into seed and the rest of the data
    const [seed, data] = decompressed.split('-');

    // Parse the data part
    const pattern = /([a-zA-Z])([^a-zA-Z]+)/g;
    let match;
    const settings: any = {};

    while ((match = pattern.exec(data)) !== null) {
        settings[match[1]] = match[2];
    }

    console.log(settings);

    // Reconstruct the objects (if needed)
    // Assuming you have appropriate constructors or factories for these objects
    const horse: Horse = {
        speed: parseInt(settings['r']),
        stamina: parseInt(settings['s']),
        power: parseInt(settings['p']),
        guts: parseInt(settings['g']),
        wiz: parseInt(settings['w']),
        current_running_style: parseInt(settings['c']),
        ground: parseInt(settings['g']),
        distance: parseInt(settings['d']),
        style: parseInt(settings['y']),
        motivation: parseInt(settings['m']),
        // ... handle the skills array 'k' appropriately
        character_id: 0,
        chard_id: 0,
        fans: 0,
        skills: []
    };

    const LocationEnum: LocationEnum = parseInt(settings['t']); // Adapt this according to how you initialize Location
    const track = {
        length: parseInt(settings['l']),
        surface: parseInt(settings['o']),
        // ... other properties if there are any
    };

    return { horse, LocationEnum, track, seed };
}
