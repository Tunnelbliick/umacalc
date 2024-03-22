import { Track } from "../../../track/track";

export const ooiData: Track[] = [
    {
        "location": "Ooi",
        "length": 1200,
        "phases": [
            {
                "start": 0,
                "end": 200,
                "type": 0
            },
            {
                "start": 200,
                "end": 800,
                "type": 1
            },
            {
                "start": 800,
                "end": 1000,
                "type": 2
            },
            {
                "start": 1000,
                "end": 1200,
                "type": 3
            }
        ],
        "corners": [
            {
                "start": 500,
                "end": 650
            },
            {
                "start": 650,
                "end": 814
            }
        ],
        "slopes": [],
        "straights": [
            {
                "start": 0,
                "end": 500
            },
            {
                "start": 814,
                "end": 1200
            }
        ],
        "other": {
            "keep": {
                "start": 0,
                "end": 500
            },
            "spurt": {
                "start": 800
            },
            "threshold": [
                "Guts",
                "Wisdom"
            ]
        },
        "surface": 1,
        "inout": "inner",
        "condition": 0,
        "distance": 0
    },
    {
        "location": "Ooi",
        "length": 1800,
        "phases": [
            {
                "start": 0,
                "end": 300,
                "type": 0
            },
            {
                "start": 300,
                "end": 1200,
                "type": 1
            },
            {
                "start": 1200,
                "end": 1500,
                "type": 2
            },
            {
                "start": 1500,
                "end": 1800,
                "type": 3
            }
        ],
        "corners": [
            {
                "start": 300,
                "end": 450
            },
            {
                "start": 500,
                "end": 650
            },
            {
                "start": 1100,
                "end": 1250
            },
            {
                "start": 1250,
                "end": 1414
            }
        ],
        "slopes": [],
        "straights": [
            {
                "start": 0,
                "end": 301
            },
            {
                "start": 1414,
                "end": 1800
            }
        ],
        "other": {
            "keep": {
                "start": 0,
                "end": 750
            },
            "spurt": {
                "start": 1200
            },
            "threshold": [
                "Power"
            ]
        },
        "surface": 1,
        "inout": "inner",
        "condition": 0,
        "distance": 1
    },
    {
        "location": "Ooi",
        "length": 2000,
        "phases": [
            {
                "start": 0,
                "end": 333,
                "type": 0
            },
            {
                "start": 333,
                "end": 1333,
                "type": 1
            },
            {
                "start": 1333,
                "end": 1667,
                "type": 2
            },
            {
                "start": 1667,
                "end": 2000,
                "type": 3
            }
        ],
        "corners": [
            {
                "start": 500,
                "end": 650
            },
            {
                "start": 650,
                "end": 800
            },
            {
                "start": 1300,
                "end": 1450
            },
            {
                "start": 1450,
                "end": 1614
            }
        ],
        "slopes": [],
        "straights": [
            {
                "start": 0,
                "end": 500
            },
            {
                "start": 800,
                "end": 1300
            },
            {
                "start": 1614,
                "end": 2000
            }
        ],
        "other": {
            "keep": {
                "start": 0,
                "end": 833
            },
            "spurt": {
                "start": 1333
            },
            "threshold": [
                "Stamina"
            ]
        },
        "surface": 1,
        "inout": "inner",
        "condition": 0,
        "distance": 2
    }
]