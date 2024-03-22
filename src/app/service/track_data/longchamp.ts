import { Track } from "../../../track/track";

export const longchampData: Track[] = [
    {
        "location": "Longchamp",
        "length": 2400,
        "phases": [
            {
                "start": 0,
                "end": 400,
                "type": 0
            },
            {
                "start": 400,
                "end": 1600,
                "type": 1
            },
            {
                "start": 1600,
                "end": 2000,
                "type": 2
            },
            {
                "start": 2000,
                "end": 2400,
                "type": 3
            }
        ],
        "corners": [
            {
                "start": 1000,
                "end": 1417
            },
            {
                "start": 1417,
                "end": 1617
            }
        ],
        "slopes": [
            {
                "start": 400,
                "end": 1000,
                "elevation": 2.0
            },
            {
                "start": 1017,
                "end": 1400,
                "elevation": -2.0
            },
            {
                "start": 1400,
                "end": 1617,
                "elevation": -1.5
            }
        ],
        "straights": [
            {
                "start": 0,
                "end": 1000
            },
            {
                "start": 1617,
                "end": 1866
            },
            {
                "start": 1867,
                "end": 2400
            }
        ],
        "other": {
            "keep": {
                "start": 0,
                "end": 1000
            },
            "spurt": {
                "start": 1600
            },
            "threshold": [
                "Stamina",
                "Power"
            ]
        },
        "surface": 0,
        "inout": "inner",
        "condition": 0,
        "distance": 2
    }
]