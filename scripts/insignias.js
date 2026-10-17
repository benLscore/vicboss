// THIS SCRIPT WAS CREATED USING GENERATIVE AI

// Insignia ownership mapping tested with PC saves
// Slots are sparse. Do not replace them with the catalogue index.
(function(global){
    "use strict";
    const BASE=0x1C04E;
    const entries=Object.freeze([
    {
        "id": 1,
        "slot": 0,
        "name": "Stealth Master (Rank C)",
        "description": "Awarded for completing over 25 missions without being spotted by the enemy",
        "note": ""
    },
    {
        "id": 2,
        "slot": 1,
        "name": "Stealth Master (Rank B)",
        "description": "Awarded for completing over 50 missions without being spotted by the enemy",
        "note": ""
    },
    {
        "id": 3,
        "slot": 2,
        "name": "Stealth Master (Rank A)",
        "description": "Awarded for completing over 100 missions without being spotted by the enemy",
        "note": ""
    },
    {
        "id": 4,
        "slot": 3,
        "name": "Master of Non-Lethal Force (Rank C)",
        "description": "Awarded for completing over 50 missions without killing anyone",
        "note": ""
    },
    {
        "id": 5,
        "slot": 4,
        "name": "Master of Non-Lethal Force (Rank B)",
        "description": "Awarded for completing over 100 missions without killing anyone",
        "note": ""
    },
    {
        "id": 6,
        "slot": 5,
        "name": "Master of Non-Lethal Force (Rank A)",
        "description": "Awarded for completing over 200 missions without killing anyone",
        "note": ""
    },
    {
        "id": 7,
        "slot": 6,
        "name": "Hold-up Master (Rank C)",
        "description": "Awarded for holding up over 100 enemy soldiers",
        "note": ""
    },
    {
        "id": 8,
        "slot": 7,
        "name": "Hold-up Master (Rank B)",
        "description": "Awarded for holding up over 250 enemy soldiers",
        "note": ""
    },
    {
        "id": 9,
        "slot": 8,
        "name": "Hold-up Master (Rank A)",
        "description": "Awarded for holding up over 500 enemy soldiers",
        "note": ""
    },
    {
        "id": 10,
        "slot": 9,
        "name": "No-Recovery Master (Rank C)",
        "description": "Awarded for completing over 50 missions without using recovery items",
        "note": ""
    },
    {
        "id": 11,
        "slot": 10,
        "name": "No-Recovery Master (Rank B)",
        "description": "Awarded for completing over 100 missions without using recovery items",
        "note": ""
    },
    {
        "id": 12,
        "slot": 11,
        "name": "No-Recovery Master (Rank A)",
        "description": "Awarded for completing over 200 missions without using recovery items",
        "note": ""
    },
    {
        "id": 13,
        "slot": 12,
        "name": "CQC Master (Rank C)",
        "description": "Awarded for using CQC over 100 times",
        "note": ""
    },
    {
        "id": 14,
        "slot": 13,
        "name": "CQC Master (Rank B)",
        "description": "Awarded for using CQC over 500 times",
        "note": ""
    },
    {
        "id": 15,
        "slot": 14,
        "name": "CQC Master (Rank A)",
        "description": "Awarded for using CQC over 1000 times",
        "note": ""
    },
    {
        "id": 16,
        "slot": 15,
        "name": "Headshot Master (Rank C)",
        "description": "Awarded for completing over 100 headshots",
        "note": ""
    },
    {
        "id": 17,
        "slot": 16,
        "name": "Headshot Master (Rank B)",
        "description": "Awarded for completing over 500 headshots",
        "note": ""
    },
    {
        "id": 18,
        "slot": 17,
        "name": "Headshot Master (Rank A)",
        "description": "Awarded for completing over 1000 headshots",
        "note": ""
    },
    {
        "id": 19,
        "slot": 18,
        "name": "CO-OPS Specialist (Rank C)",
        "description": "Awarded for exceeding a total Level of Camaraderie of 250000",
        "note": ""
    },
    {
        "id": 20,
        "slot": 19,
        "name": "CO-OPS Specialist (Rank B)",
        "description": "Awarded for exceeding a total Level of Camaraderie of 500000",
        "note": ""
    },
    {
        "id": 21,
        "slot": 20,
        "name": "CO-OPS Specialist (Rank A)",
        "description": "Awarded for exceeding a total Level of Camaraderie of 1000000",
        "note": ""
    },
    {
        "id": 22,
        "slot": 21,
        "name": "Medic Master (Rank C)",
        "description": "Awarded for exceeding a combined total of 50 CPR Rescues, Rescue Box Uses, and Battle Cry uses",
        "note": ""
    },
    {
        "id": 23,
        "slot": 22,
        "name": "Medic Master (Rank B)",
        "description": "Awarded for exceeding a combined total of 100 CPR Rescues, Rescue Box Uses, and Battle Cry uses",
        "note": ""
    },
    {
        "id": 24,
        "slot": 23,
        "name": "Medic Master (Rank A)",
        "description": "Awarded for exceeding a combined total of 200 CPR Rescues, Rescue Box Uses, and Battle Cry uses",
        "note": ""
    },
    {
        "id": 25,
        "slot": 24,
        "name": "CO-OP In Specialist",
        "description": "Awarded for exceeding 250 CO-OP Ins",
        "note": ""
    },
    {
        "id": 26,
        "slot": 25,
        "name": "Snake Formation Specialist",
        "description": "Awarded for exceeding 250 Snake Ins",
        "note": ""
    },
    {
        "id": 27,
        "slot": 26,
        "name": "Sync Specialist",
        "description": "Awarded for exceeding 250 Snake Syncs",
        "note": ""
    },
    {
        "id": 28,
        "slot": 31,
        "name": "Mission Completion Specialist (Rank C)",
        "description": "Awarded for completing all missions in both SINGLE and CO-OPS",
        "note": "Complete every mission in both SINGLE and CO-OPS modes. Some missions can only be played in SINGLE mode."
    },
    {
        "id": 29,
        "slot": 32,
        "name": "Mission Completion Specialist (Rank B)",
        "description": "Awarded for completing all missions with Rank A or better in both SINGLE and CO-OPs",
        "note": ""
    },
    {
        "id": 30,
        "slot": 33,
        "name": "Mission Completion Specialist (Rank A)",
        "description": "Awarded for completing all missions with Rank S in both SINGLE and CO-OPs",
        "note": ""
    },
    {
        "id": 31,
        "slot": 34,
        "name": "OUTER OPS Specialist (Rank C)",
        "description": "Awarded for completing over 25% of OUTER OPS missions",
        "note": ""
    },
    {
        "id": 32,
        "slot": 35,
        "name": "OUTER OPS Specialist (Rank B)",
        "description": "Awarded for completing over 50% of OUTER OPS missions",
        "note": ""
    },
    {
        "id": 33,
        "slot": 36,
        "name": "OUTER OPS Specialist (Rank A)",
        "description": "Awarded for completing all OUTER OPS missions",
        "note": ""
    },
    {
        "id": 34,
        "slot": 37,
        "name": "Mission Completion Pro",
        "description": "Awarded for completing over 500 missions",
        "note": ""
    },
    {
        "id": 35,
        "slot": 41,
        "name": "Naked Enthusiast",
        "description": "Awarded for bravely completing 200 missions naked",
        "note": ""
    },
    {
        "id": 36,
        "slot": 43,
        "name": "Fulton Recovery Specialist (Rank C)",
        "description": "Awarded for performing Fulton Recoveries on over 100 people",
        "note": ""
    },
    {
        "id": 37,
        "slot": 44,
        "name": "Fulton Recovery Specialist (Rank B)",
        "description": "Awarded for performing Fulton Recoveries on over 500 people",
        "note": ""
    },
    {
        "id": 38,
        "slot": 45,
        "name": "Fulton Recovery Specialist (Rank A)",
        "description": "Awarded for performing Fulton Recoveries on over 1000 people",
        "note": ""
    },
    {
        "id": 39,
        "slot": 46,
        "name": "Parts Recovery Specialist (Rank C)",
        "description": "Awarded for getting over 15 mech parts",
        "note": ""
    },
    {
        "id": 40,
        "slot": 47,
        "name": "Parts Recovery Specialist (Rank B)",
        "description": "Awarded for getting over 30 mech parts",
        "note": ""
    },
    {
        "id": 41,
        "slot": 48,
        "name": "Parts Recovery Specialist (Rank A)",
        "description": "Awarded for getting 49 or more mech parts",
        "note": ""
    },
    {
        "id": 42,
        "slot": 49,
        "name": "Monster Hunting Specialist (Rank C)",
        "description": "Awarded for hunting over 50 monsters",
        "note": ""
    },
    {
        "id": 43,
        "slot": 50,
        "name": "Monster Hunting Specialist (Rank B)",
        "description": "Awarded for hunting over 100 monsters",
        "note": ""
    },
    {
        "id": 44,
        "slot": 51,
        "name": "Monster Hunting Specialist (Rank A)",
        "description": "Awarded for hunting over 200 monsters",
        "note": ""
    },
    {
        "id": 45,
        "slot": 52,
        "name": "Insignia Collection Specialist (Rank C)",
        "description": "Awarded for receiving over 10% of all insignias",
        "note": ""
    },
    {
        "id": 46,
        "slot": 53,
        "name": "Insignia Collection Specialist (Rank B)",
        "description": "Awarded for receiving over 50% of all insignias",
        "note": ""
    },
    {
        "id": 47,
        "slot": 54,
        "name": "Insignia Collection Specialist (Rank A)",
        "description": "Awarded for receiving all insignias",
        "note": ""
    },
    {
        "id": 48,
        "slot": 55,
        "name": "Codename Collection Specialist (Rank C)",
        "description": "Awarded for receiving over 10% of all codenames",
        "note": ""
    },
    {
        "id": 49,
        "slot": 56,
        "name": "Codename Collection Specialist (Rank B)",
        "description": "Awarded for receiving over 50% of all codenames",
        "note": ""
    },
    {
        "id": 50,
        "slot": 57,
        "name": "Codename Collection Specialist (Rank A)",
        "description": "Awarded for receiving all codenames",
        "note": ""
    },
    {
        "id": 51,
        "slot": 58,
        "name": "WAC Coordinator",
        "description": "Awarded for forming an all-female MSF team",
        "note": "You must have 350 soldiers (not including UNQ staff) who are female. This means dismissing ALL of your Male staff. Hideo must be dismissed, but can be recruited again afterwards."
    },
    {
        "id": 52,
        "slot": 59,
        "name": "Item Creator",
        "description": "Awarded for developing all items",
        "note": ""
    },
    {
        "id": 53,
        "slot": 60,
        "name": "Weapon Creator",
        "description": "Awarded for developing all weapons",
        "note": ""
    },
    {
        "id": 54,
        "slot": 61,
        "name": "Mech Hunting Specialist",
        "description": "Awarded for capturing all mechs",
        "note": ""
    },
    {
        "id": 55,
        "slot": 62,
        "name": "Handgun Specialist",
        "description": "Awarded for attaining the maximum level for all handguns",
        "note": ""
    },
    {
        "id": 56,
        "slot": 63,
        "name": "Submachine Gun Specialist",
        "description": "Awarded for attaining the maximum level for all submachine guns",
        "note": ""
    },
    {
        "id": 57,
        "slot": 64,
        "name": "Shotgun Specialist",
        "description": "Awarded for attaining the maximum level for all shotguns",
        "note": ""
    },
    {
        "id": 58,
        "slot": 65,
        "name": "Assault Rifle Specialist",
        "description": "Awarded for attaining the maximum level for all assault rifles",
        "note": ""
    },
    {
        "id": 59,
        "slot": 66,
        "name": "Sniper Rifle Specialist",
        "description": "Awarded for attaining the maximum level for all sniper rifles",
        "note": ""
    },
    {
        "id": 60,
        "slot": 67,
        "name": "Machine Gun Specialist",
        "description": "Awarded for attaining the maximum level for all machine guns",
        "note": ""
    },
    {
        "id": 61,
        "slot": 68,
        "name": "Missile Specialist",
        "description": "Awarded for attaining the maximum level for all missiles and rocket weapons",
        "note": ""
    },
    {
        "id": 62,
        "slot": 69,
        "name": "Grenade Specialist",
        "description": "Awarded for attaining the maximum level for all throwing weapons",
        "note": ""
    },
    {
        "id": 63,
        "slot": 70,
        "name": "Explosives Specialist",
        "description": "Awarded for attaining the maximum level for all placeable weapons",
        "note": ""
    },
    {
        "id": 64,
        "slot": 71,
        "name": "Stun Rod Specialist",
        "description": "Awarded for attaining the maximum level for the stun rod",
        "note": ""
    },
    {
        "id": 65,
        "slot": 72,
        "name": "Weapons Master",
        "description": "Awarded for attaining the maximum level for all weapons",
        "note": ""
    },
    {
        "id": 66,
        "slot": 73,
        "name": "Mother Base Development Specialist",
        "description": "Awarded for improving Mother Base to the final stage of development",
        "note": "Increase every Mother Base platform to the maximum level."
    },
    {
        "id": 67,
        "slot": 74,
        "name": "Mother Base Master",
        "description": "Awarded for pursuing all development at Mother Base to the final stage",
        "note": "Max every Mother Base platform and develop every weapon/item"
    },
    {
        "id": 68,
        "slot": 75,
        "name": "VS Rookie",
        "description": "Awarded for first battle in a versus game",
        "note": ""
    },
    {
        "id": 69,
        "slot": 76,
        "name": "VS Enthusiast (Rank C)",
        "description": "Awarded for playing over 50 VS matches",
        "note": ""
    },
    {
        "id": 70,
        "slot": 77,
        "name": "VS Enthusiast (Rank B)",
        "description": "Awarded for playing over 100 VS matches",
        "note": ""
    },
    {
        "id": 71,
        "slot": 78,
        "name": "VS Enthusiast (Rank A)",
        "description": "Awarded for playing over 250 VS matches",
        "note": ""
    },
    {
        "id": 72,
        "slot": 82,
        "name": "VS Master (Rank C)",
        "description": "Awarded for winning over 50 VS matches",
        "note": ""
    },
    {
        "id": 73,
        "slot": 83,
        "name": "VS Master (Rank B)",
        "description": "Awarded for winning over 100 VS matches",
        "note": ""
    },
    {
        "id": 74,
        "slot": 84,
        "name": "VS Master (Rank A)",
        "description": "Awarded for winning over 200 VS matches",
        "note": ""
    },
    {
        "id": 75,
        "slot": 88,
        "name": "Deathmatch Master",
        "description": "Awarded for winning 50 matches under Deathmatch (DM) rules",
        "note": ""
    },
    {
        "id": 76,
        "slot": 89,
        "name": "Team Deathmatch Master",
        "description": "Awarded for winning 50 matches under Team Deathmatch (TDM) rules",
        "note": ""
    },
    {
        "id": 77,
        "slot": 90,
        "name": "Base Master",
        "description": "Awarded for winning 50 matches under Base (BASE) rules",
        "note": ""
    },
    {
        "id": 78,
        "slot": 91,
        "name": "Capture Pro",
        "description": "Awarded for winning 50 matches under Capture (CAP) rules",
        "note": ""
    },
    {
        "id": 79,
        "slot": 92,
        "name": "VS Battle Master (Rank C)",
        "description": "Awarded for performing over 100 kills, sleeps, and knockouts in VS",
        "note": ""
    },
    {
        "id": 80,
        "slot": 93,
        "name": "VS Battle Master (Rank B)",
        "description": "Awarded for performing over 250 kills, sleeps, and knockouts in VS",
        "note": ""
    },
    {
        "id": 81,
        "slot": 94,
        "name": "VS Battle Master (Rank A)",
        "description": "Awarded for performing over 500 kills, sleeps, and knockouts in VS",
        "note": ""
    },
    {
        "id": 82,
        "slot": 107,
        "name": "VS Fulton Recovery Specialist (Rank C)",
        "description": "Awarded for performing over 10 Fulton Recoveries in VS",
        "note": ""
    },
    {
        "id": 83,
        "slot": 108,
        "name": "VS Fulton Recovery Specialist (Rank B)",
        "description": "Awarded for performing over 50 Fulton Recoveries in VS",
        "note": ""
    },
    {
        "id": 84,
        "slot": 109,
        "name": "VS Fulton Recovery Specialist (Rank A)",
        "description": "Awarded for performing over 100 Fulton Recoveries in VS",
        "note": ""
    }
].map(Object.freeze));
    function parse(bytes){
        return Object.freeze(entries.map(entry=>{
            const raw=bytes[BASE+entry.slot];
            return Object.freeze({...entry,obtained:!!(raw&1),isNew:!!(raw&2)});
        }));
    }
    function write(bytes,id,obtained){
        if(!Number.isInteger(id))throw Error("Invalid insignia ID");
        if(typeof obtained!=="boolean")throw Error("Insignia ownership must be true or false");
        const entry=entries.find(e=>e.id===id);
        if(!entry)throw Error("Unknown insignia ID");
        const offset=BASE+entry.slot,old=bytes[offset];
        if(!!(old&1)===obtained)return false;
        bytes[offset]=obtained?(old|3):(old&~3);
        return true;
    }
    global.VicbossInsignias=Object.freeze({entries,parse,write});
})(window);
