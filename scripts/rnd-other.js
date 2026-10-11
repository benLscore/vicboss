// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* R&D Other mapping and guarded ownership/stock editing. PC inventory records: plaintext 0xE2E8 + id * 0x18.
   Record IDs and the visible roster were checked against the user's main save.
   Document target labels originate from the research mapping; not every target
   has been individually checked in-game. Catalog intentionally omits unmapped
   entries (including bonus outfits) and the trainer's placeholder records. */
(function (global) {
    'use strict';
    const catalog = {
    "keys": [
        {
            "id": 1,
            "name": "Letter"
        },
        {
            "id": 4,
            "name": "EZ Gun (LR) - Design Specs"
        },
        {
            "id": 6,
            "name": "PM - Design Specs"
        },
        {
            "id": 7,
            "name": "PB/6P9 - Design Specs"
        },
        {
            "id": 8,
            "name": "M1911A1 - Design Specs"
        },
        {
            "id": 9,
            "name": "M1911A1 Ct. - Design Specs"
        },
        {
            "id": 10,
            "name": "C96 - Design Specs"
        },
        {
            "id": 11,
            "name": "M19 - Design Specs"
        },
        {
            "id": 12,
            "name": "Kampfpistole - Design Specs"
        },
        {
            "id": 13,
            "name": "Sprt Sply Mk. - Design Specs"
        },
        {
            "id": 14,
            "name": "Sprt Strk Mk. - Design Specs"
        },
        {
            "id": 15,
            "name": "Banana - Design Specs"
        },
        {
            "id": 16,
            "name": "Twin Barrel - Design Specs"
        },
        {
            "id": 17,
            "name": "Twin Brrl(RS) - Design Specs"
        },
        {
            "id": 18,
            "name": "M37 - Design Specs"
        },
        {
            "id": 19,
            "name": "SPAS-12 - Design Specs"
        },
        {
            "id": 20,
            "name": "CAW - Design Specs"
        },
        {
            "id": 21,
            "name": "M16(STG) - Design Specs"
        },
        {
            "id": 22,
            "name": "M16(STG+L) - Design Specs"
        },
        {
            "id": 23,
            "name": "Patriot - Design Specs"
        },
        {
            "id": 24,
            "name": "M16(GL) - Design Specs"
        },
        {
            "id": 25,
            "name": "M16(GL+L) - Design Specs"
        },
        {
            "id": 26,
            "name": "M16(SGL) - Design Specs"
        },
        {
            "id": 27,
            "name": "M16(SGL+L) - Design Specs"
        },
        {
            "id": 28,
            "name": "M653 - Design Specs"
        },
        {
            "id": 29,
            "name": "M653(GL) - Design Specs"
        },
        {
            "id": 30,
            "name": "M653(STG) - Design Specs"
        },
        {
            "id": 31,
            "name": "M653(SGL) - Design Specs"
        },
        {
            "id": 32,
            "name": "RK47 - Design Specs"
        },
        {
            "id": 33,
            "name": "RK47(GL) - Design Specs"
        },
        {
            "id": 34,
            "name": "ADM63 - Design Specs"
        },
        {
            "id": 36,
            "name": "RK47(SGL) - Design Specs"
        },
        {
            "id": 37,
            "name": "RPK - Design Specs"
        },
        {
            "id": 38,
            "name": "FAL - Design Specs"
        },
        {
            "id": 39,
            "name": "SUG - Design Specs"
        },
        {
            "id": 40,
            "name": "G11 - Design Specs"
        },
        {
            "id": 42,
            "name": "M10 - Design Specs"
        },
        {
            "id": 43,
            "name": "M10 (BJ) - Design Specs"
        },
        {
            "id": 44,
            "name": "UZ61 - Design Specs"
        },
        {
            "id": 45,
            "name": "MP5A2 - Design Specs"
        },
        {
            "id": 46,
            "name": "MP5SD2 - Design Specs"
        },
        {
            "id": 47,
            "name": "M1928A1 - Design Specs"
        },
        {
            "id": 48,
            "name": "M1C - Design Specs"
        },
        {
            "id": 49,
            "name": "M1C (PR) - Design Specs"
        },
        {
            "id": 50,
            "name": "M21 - Design Specs"
        },
        {
            "id": 51,
            "name": "M700 - Design Specs"
        },
        {
            "id": 52,
            "name": "M700 (LR) - Design Specs"
        },
        {
            "id": 53,
            "name": "Mosin - Design Specs"
        },
        {
            "id": 54,
            "name": "SVD - Design Specs"
        },
        {
            "id": 55,
            "name": "SVD(NV) - Design Specs"
        },
        {
            "id": 56,
            "name": "WA2000 - Design Specs"
        },
        {
            "id": 57,
            "name": "PTRD1941 - Design Specs"
        },
        {
            "id": 58,
            "name": "PTRS1941 - Design Specs"
        },
        {
            "id": 59,
            "name": "Stealth Gun - Design Specs"
        },
        {
            "id": 60,
            "name": "Railgun - Design Specs"
        },
        {
            "id": 61,
            "name": "M60 - Design Specs"
        },
        {
            "id": 62,
            "name": "M60 (AP) - Design Specs"
        },
        {
            "id": 63,
            "name": "M63A1 - Design Specs"
        },
        {
            "id": 64,
            "name": "PKM - Design Specs"
        },
        {
            "id": 65,
            "name": "MG3 - Design Specs"
        },
        {
            "id": 66,
            "name": "MG3 (AP) - Design Specs"
        },
        {
            "id": 67,
            "name": "M134 - Design Specs"
        },
        {
            "id": 68,
            "name": "EM Wave - Design Specs"
        },
        {
            "id": 70,
            "name": "M202A1 - Design Specs"
        },
        {
            "id": 71,
            "name": "M202A1(2) - Design Specs"
        },
        {
            "id": 72,
            "name": "RPG-2 - Design Specs"
        },
        {
            "id": 73,
            "name": "RPG-7 - Design Specs"
        },
        {
            "id": 74,
            "name": "FIM-43 - Design Specs"
        },
        {
            "id": 75,
            "name": "XFIM-92A - Design Specs"
        },
        {
            "id": 76,
            "name": "C.Gustav - Design Specs"
        },
        {
            "id": 77,
            "name": "C.Gustav(M) - Design Specs"
        },
        {
            "id": 78,
            "name": "C.Gustav(F) - Design Specs"
        },
        {
            "id": 79,
            "name": "M47 - Design Specs"
        },
        {
            "id": 81,
            "name": "Stun G. - Design Specs"
        },
        {
            "id": 82,
            "name": "Smoke G. - Design Specs"
        },
        {
            "id": 83,
            "name": "Chaff G. - Design Specs"
        },
        {
            "id": 84,
            "name": "Smoke G.(C) - Design Specs"
        },
        {
            "id": 85,
            "name": "Sply(Throw) - Design Specs"
        },
        {
            "id": 86,
            "name": "Strk(Throw) - Design Specs"
        },
        {
            "id": 87,
            "name": "EM Net - Design Specs"
        },
        {
            "id": 88,
            "name": "Sleep Gas G. - Design Specs"
        },
        {
            "id": 89,
            "name": "C4 - Design Specs"
        },
        {
            "id": 91,
            "name": "Magazine - Design Specs"
        },
        {
            "id": 92,
            "name": "Hobby Mag1 - Design Specs"
        },
        {
            "id": 93,
            "name": "Hobby Mag2 - Design Specs"
        },
        {
            "id": 94,
            "name": "Hobby Mag3 - Design Specs"
        },
        {
            "id": 95,
            "name": "Hobby Mag4 - Design Specs"
        },
        {
            "id": 96,
            "name": "AT Mine - Design Specs"
        },
        {
            "id": 97,
            "name": "Decoy - Design Specs"
        },
        {
            "id": 98,
            "name": "Aerial Mine - Design Specs"
        },
        {
            "id": 99,
            "name": "F.S.G. Mine - Design Specs"
        },
        {
            "id": 100,
            "name": "Cookbook - Design Specs"
        },
        {
            "id": 101,
            "name": "Sply(Set) - Design Specs"
        },
        {
            "id": 102,
            "name": "Strk(Set) - Design Specs"
        },
        {
            "id": 103,
            "name": "Curry - Design Specs"
        },
        {
            "id": 104,
            "name": "Stealth Mat - Design Specs"
        },
        {
            "id": 105,
            "name": "Stealth Camo - Design Specs"
        },
        {
            "id": 107,
            "name": "Box Tank - Design Specs"
        },
        {
            "id": 108,
            "name": "NVGs - Design Specs"
        },
        {
            "id": 109,
            "name": "Shield - Design Specs"
        },
        {
            "id": 110,
            "name": "Shield(Color) - Design Specs"
        },
        {
            "id": 111,
            "name": "Bandana - Design Specs"
        },
        {
            "id": 112,
            "name": "Soliton Radar - Design Specs"
        },
        {
            "id": 113,
            "name": "Sonic Eye - Design Specs"
        },
        {
            "id": 114,
            "name": "Soft Drink - Design Specs"
        },
        {
            "id": 115,
            "name": "T.Chips - Design Specs"
        },
        {
            "id": 116,
            "name": "Box Bomb - Design Specs"
        },
        {
            "id": 117,
            "name": "Stun Box - Design Specs"
        },
        {
            "id": 118,
            "name": "Smoke Box - Design Specs"
        },
        {
            "id": 121,
            "name": "Rescue Box - Design Specs"
        },
        {
            "id": 125,
            "name": "Cologne - Design Specs"
        },
        {
            "id": 126,
            "name": "Rathalos Wing"
        },
        {
            "id": 127,
            "name": "Tigrex Fang"
        },
        {
            "id": 128,
            "name": "Gear Rex Mucous"
        },
        {
            "id": 129,
            "name": "Gear Rex Concentrate"
        },
        {
            "id": 130,
            "name": "Gear Rex Super Extract"
        }
    ],
    "bullets": [
        {
            "id": 339,
            "name": "12 Gauge Shotshell"
        },
        {
            "id": 340,
            "name": "14.5x114mm"
        },
        {
            "id": 341,
            "name": "19.5x76mm"
        },
        {
            "id": 342,
            "name": ".32ACP"
        },
        {
            "id": 343,
            "name": ".357 Magnum"
        },
        {
            "id": 344,
            "name": "4.73x33mm"
        },
        {
            "id": 345,
            "name": "40mm Grenade (M16)"
        },
        {
            "id": 346,
            "name": "40mm Grenade (RK)"
        },
        {
            "id": 347,
            "name": ".45ACP"
        },
        {
            "id": 348,
            "name": "5.56x45mm"
        },
        {
            "id": 349,
            "name": "7.62x39mm"
        },
        {
            "id": 350,
            "name": "7.62x51mm"
        },
        {
            "id": 351,
            "name": "7.62x54R"
        },
        {
            "id": 352,
            "name": "7.62x63mm"
        },
        {
            "id": 353,
            "name": "9x19mm"
        },
        {
            "id": 354,
            "name": "9x18mm"
        },
        {
            "id": 355,
            "name": "HEAT Round"
        },
        {
            "id": 356,
            "name": "Psyche Recovery Round"
        },
        {
            "id": 357,
            "name": "Life Recovery Round"
        },
        {
            "id": 358,
            "name": "Anesthetic Round (Handgun)"
        },
        {
            "id": 359,
            "name": "12G. Rubber Rounds"
        },
        {
            "id": 360,
            "name": "40mm Smoke Rounds (M16)"
        },
        {
            "id": 361,
            "name": "40mm Smoke Rounds (RK)"
        },
        {
            "id": 362,
            "name": "Support Strike Marker (Fired)"
        },
        {
            "id": 363,
            "name": "Support Supply Marker (Fired)"
        },
        {
            "id": 364,
            "name": "Lead Ball"
        },
        {
            "id": 365,
            "name": "Anesthetic Round (Rifle)"
        },
        {
            "id": 366,
            "name": "7.62x51mm (Armor-Piercing)"
        },
        {
            "id": 367,
            "name": "Railgun Ammo"
        },
        {
            "id": 368,
            "name": "RPG2 Ammo"
        },
        {
            "id": 369,
            "name": "RPG7 Ammo"
        },
        {
            "id": 370,
            "name": "Carl Gustav Ammo"
        },
        {
            "id": 371,
            "name": "Carl Gustav HEAT Ammo"
        },
        {
            "id": 373,
            "name": "FIM-43 Missile"
        },
        {
            "id": 374,
            "name": "XFIM-92A Missile"
        },
        {
            "id": 375,
            "name": "M47 Missile"
        },
        {
            "id": 376,
            "name": "LAW Rocket"
        },
        {
            "id": 377,
            "name": "M202 Rocket"
        },
        {
            "id": 378,
            "name": "Carl Gustav Fulton Rounds"
        },
        {
            "id": 379,
            "name": "5.56x45mm (Armor-Piercing)"
        },
        {
            "id": 380,
            "name": "7.62x54R (Armor-Piercing)"
        }
    ],
    "uniforms": [
        {
            "id": 131,
            "name": "Jungle Fatigues"
        },
        {
            "id": 132,
            "name": "Leaf"
        },
        {
            "id": 133,
            "name": "Tiger Stripe"
        },
        {
            "id": 134,
            "name": "Choco Chip"
        },
        {
            "id": 135,
            "name": "Desert Auscam"
        },
        {
            "id": 136,
            "name": "Squares"
        },
        {
            "id": 137,
            "name": "Splitter"
        },
        {
            "id": 138,
            "name": "Snake"
        },
        {
            "id": 139,
            "name": "Neo Moss"
        },
        {
            "id": 140,
            "name": "Stench"
        },
        {
            "id": 141,
            "name": "Tigrex"
        },
        {
            "id": 142,
            "name": "Rathalos"
        },
        {
            "id": 143,
            "name": "Gear REX"
        },
        {
            "id": 144,
            "name": "Sneaking Suit"
        },
        {
            "id": 145,
            "name": "Battle Dress"
        },
        {
            "id": 146,
            "name": "Battle Dress (with helmet)"
        },
        {
            "id": 147,
            "name": "Naked"
        },
        {
            "id": 148,
            "name": "Naked (Leaf)"
        },
        {
            "id": 149,
            "name": "Naked (Tiger Stripe)"
        },
        {
            "id": 150,
            "name": "Naked (Choco Chip)"
        },
        {
            "id": 151,
            "name": "Naked (Desert Auscam)"
        },
        {
            "id": 152,
            "name": "Naked (Squares)"
        },
        {
            "id": 153,
            "name": "Naked (Splitter)"
        },
        {
            "id": 154,
            "name": "Naked (Snake)"
        },
        {
            "id": 155,
            "name": "Tuxedo"
        },
        {
            "id": 156,
            "name": "Miller"
        },
        {
            "id": 157,
            "name": "Amanda"
        },
        {
            "id": 158,
            "name": "Swim Trunks"
        },
        {
            "id": 159,
            "name": "Bikini Top"
        },
        {
            "id": 160,
            "name": "T-shirt"
        },
        {
            "id": 161,
            "name": "UT (N425A)"
        },
        {
            "id": 162,
            "name": "UT (N425B)"
        },
        {
            "id": 163,
            "name": "UT (N425C)"
        },
        {
            "id": 164,
            "name": "UT (N425D Navy Blue)"
        },
        {
            "id": 165,
            "name": "UT (N425E White)"
        },
        {
            "id": 166,
            "name": "UT (N425E Black)"
        },
        {
            "id": 167,
            "name": "UT (N425F)"
        },
        {
            "id": 168,
            "name": "UT (N425G Gray)"
        },
        {
            "id": 169,
            "name": "UT(N425H White)"
        },
        {
            "id": 170,
            "name": "UT(N425H Red)"
        },
        {
            "id": 171,
            "name": "UT (N425J)"
        },
        {
            "id": 172,
            "name": "UT (N425L)"
        },
        {
            "id": 173,
            "name": "UT (UT Logo)"
        },
        {
            "id": 174,
            "name": "UT (N425D Gray)"
        },
        {
            "id": 175,
            "name": "UT (N425G White)"
        },
        {
            "id": 181,
            "name": "MUSIC PLAYER"
        },
        {
            "id": 185,
            "name": "Fox"
        },
        {
            "id": 210,
            "name": "Russian Commando"
        },
        {
            "id": 211,
            "name": "Russian Soldier"
        },
        {
            "id": 212,
            "name": "Scout"
        },
        {
            "id": 213,
            "name": "Guard"
        },
        {
            "id": 214,
            "name": "Commando"
        },
        {
            "id": 215,
            "name": "Male P.O.W."
        },
        {
            "id": 216,
            "name": "Patrolman"
        },
        {
            "id": 217,
            "name": "Female P.O.W."
        },
        {
            "id": 218,
            "name": "Mechanic"
        },
        {
            "id": 219,
            "name": "Escort"
        }
    ]
};
    for (const entries of Object.values(catalog)) {
        entries.forEach(Object.freeze); Object.freeze(entries);
    }
    Object.freeze(catalog);
    const labels = Object.freeze({keys: 'Key Items', bullets: 'Bullets', uniforms: 'Uniforms'});
    function parse(plain) {
        if (!(plain instanceof Uint8Array)) throw new TypeError('Expected decrypted save bytes');
        const view = new DataView(plain.buffer, plain.byteOffset, plain.byteLength);
        return Object.freeze(Object.entries(catalog).map(([key, entries]) => Object.freeze({
            key, label: labels[key], entries: Object.freeze(entries.map(entry => {
                const offset = 0xE2E8 + entry.id * 0x18;
                if (offset + 0x18 > view.byteLength || view.getUint32(offset, true) !== entry.id) {
                    return Object.freeze({...entry, available: false, owned: null, stock: null});
                }
                const state = view.getUint32(offset + 4, true);
                return Object.freeze({...entry, available: true,
                    owned: state === 3 ? true : state === 1 ? false : null,
                    stock: view.getUint32(offset + 12, true)});
            }))
        })));
    }
    function edit(plain, id, patch) {
        if (!Number.isInteger(id) || !patch || typeof patch !== 'object' || Array.isArray(patch) ||
            !Object.keys(patch).length || Object.keys(patch).some(k => !['owned', 'stock'].includes(k))) {
            throw Error('Unsupported Other edit.');
        }
        const group = parse(plain).find(g => g.entries.some(e => e.id === id));
        const entry = group?.entries.find(e => e.id === id);
        if (!entry?.available || entry.owned === null) throw Error('This Other entry cannot be edited.');
        if ('owned' in patch && typeof patch.owned !== 'boolean') throw Error('Obtained must be true or false.');
        const owned = patch.owned ?? entry.owned;
        if ('stock' in patch && (group.key !== 'bullets' || !owned || !Number.isInteger(patch.stock) || patch.stock < 0 || patch.stock > 9999)) {
            throw Error('Ammunition stock must be an integer from 0 to 9999 for an obtained entry.');
        }
        const out = plain.slice(), view = new DataView(out.buffer, out.byteOffset, out.byteLength);
        const offset = 0xE2E8 + id * 0x18;
        // These entries have no development progression. Preserve progress,
        // notification flags and all unrelated bytes; change only state/stock.
        if ('owned' in patch) {
            view.setUint32(offset + 4, owned ? 3 : 1, true);
            if (group.key !== 'bullets') view.setUint32(offset + 12, 1, true);
        }
        if ('stock' in patch) view.setUint32(offset + 12, patch.stock, true);
        return out;
    }
    global.VicbossRnDOther = Object.freeze({parse, catalog, edit});
})(window);
