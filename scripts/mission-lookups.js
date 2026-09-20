// THIS SCRIPT WAS CREATED USING GENERATIVE AI

(function(global){
'use strict';

// PWSE Mission Lookups v0.1
//
// Internal-ID -> displayed mission numbering was reverse-engineered from the
// Master Collection runtime mission-definition table:
//   - 161 validated player missions
//   - 33 Main Ops, 128 Extra Ops
//   - each category ordered by mission-definition +0x04
//
// Mission titles are static display labels. Keeping this file separate from
// the save codec makes later spelling/title corrections easy.

const MAIN_INTERNAL_IDS_BY_NUMBER=Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 28, 33, 29, 30, 32, 31, 34]);
const EXTRA_INTERNAL_IDS_BY_NUMBER=Object.freeze([161, 159, 162, 160, 36, 37, 38, 148, 40, 52, 53, 57, 56, 54, 59, 55, 61, 77, 78, 81, 83, 88, 85, 86, 147, 84, 155, 41, 42, 44, 45, 43, 50, 49, 92, 108, 93, 73, 67, 153, 68, 72, 71, 65, 128, 130, 131, 133, 132, 129, 115, 89, 112, 118, 156, 99, 138, 140, 103, 47, 48, 46, 109, 111, 110, 105, 157, 158, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 201, 202, 203, 204, 205, 206, 207, 208, 217, 209, 218, 210, 219, 212, 221, 222, 225, 226, 227, 228, 229, 230, 231, 232]);

const MAIN_TITLES=Object.freeze(["Opening/Investigate the Supply Facility", "Contact the Sandinista Comandante", "Pursue Amanda", "Armored Vehicle Battle: LAV-Type G", "Rescue Chico", "Pursue the Jungle Train", "Tank Battle: T-72U", "Destroy the Barricade", "Infiltrate the Crater Base", "Pupa Battle", "Travel to the Cloud Forest", "Attack Chopper Battle: Mi-24A", "Head for the Lab", "Locate the ID Card", "Chrysalis Battle", "Travel to the Mine Base", "Eliminate the Guards", "Cocoon Battle", "Infiltrate the Underground Base", "Torture Chamber Escape", "Head for Peace Walker's Hangar", "Peace Walker Battle", "Infiltrate the U.S. Missile Base", "Head to the Control Tower", "Peace Walker Battle 2", "Peace Walker Battle 3", "Zadornov Search Mission", "Zadornov Search Mission 2", "Zadornov Search Mission 3", "Zadornov Search Mission 4", "Zadornov Search Mission 5", "Zadornov Search Mission 6", "ZEKE Battle"]);
const EXTRA_TITLES=Object.freeze(["Target Practice: No Limit", "Target Practice: No Limit", "Target Practice: Score Attack", "Target Practice: Time Attack", "Marksmanship Challenge", "Marksmanship Challenge", "Marksmanship Challenge", "Marksmanship Challenge", "Marksmanship Challenge", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Fulton Recovery", "Target Demolition", "Target Demolition", "Target Demolition", "Cargo Truck Demolition", "Eliminate Enemy Soldiers", "Eliminate Enemy Soldiers", "Eliminate Enemy Soldiers", "Eliminate Enemy Soldiers", "Eliminate Enemy Soldiers", "Eliminate Enemy Soldiers", "Item Capture", "Item Capture", "Classified Document Retrieval", "Classified Document Retrieval", "Classified Document Retrieval", "Claymore Disarmament", "Claymore Disarmament", "Hold Up", "Hold Up", "Hold Up", "Base Defense", "Base Defense", "Base Defense", "Base Defense", "POW Defense", "Defend Key Supplies", "Defend Key Supplies", "Perfect Stealth", "Perfect Stealth", "Perfect Stealth", "Perfect Stealth", "Perfect Stealth", "Perfect Stealth", "Obstacle Demolition", "Eliminate the Kidnappers", "Clearing Escape", "Snake Gear Retrieval", "U.S. Soldier Rescue", "One Shot", "Paparazzi", "Paparazzi", "Ghost Photography", "Dead Man's Treasure", "Dead Man's Treasure", "Dead Man's Treasure", "Pooyan Mission", "Pooyan Mission", "Pooyan Mission", "Missile Intercept Mission", "Date with Paz", "Date with Kaz", "Armored Vehicle Battle: BTR-60 PA", "Armored Vehicle Battle: BTR-60 PA Custom", "Armored Vehicle Battle: BTR-60 PB", "Armored Vehicle Battle: BTR-60 PB Custom", "Armored Vehicle Battle: LAV-Type G Custom", "Armored Vehicle Battle: LAV-Type C", "Armored Vehicle Battle: LAV-Type C Custom", "Tank Battle: T-72U", "Tank Battle: T-72U Custom", "Tank Battle: T-72A", "Tank Battle: T-72A Custom", "Tank Battle: KPz 70", "Tank Battle: KPz 70 Custom", "Tank Battle: MBTk-70", "Tank Battle: MBTk-70 Custom", "Attack Chopper Battle: Mi-24A", "Attack Chopper Battle: Mi-24A Custom", "Attack Chopper Battle: Mi-24D", "Attack Chopper Battle: Mi-24D Custom", "Attack Chopper Battle: AH56A-Bomber", "Attack Chopper Battle: AH56A-Bomber Custom", "Attack Chopper Battle: AH56A-Raider", "Attack Chopper Battle: AH56A-Raider Custom", "Tank Battle: T-72U Custom", "Tank Battle: T-72A", "Tank Battle: T-72A Custom", "Tank Battle: KPz 70", "Tank Battle: KPz 70 Custom", "Tank Battle: MBTk-70", "Tank Battle: MBTk-70 Custom", "Armored Vehicle Battle: BTR-60 PA", "Armored Vehicle Battle: BTR-60 PA Custom", "Armored Vehicle Battle: BTR-60 PB", "Armored Vehicle Battle: BTR-60 PB Custom", "Armored Vehicle Battle: LAV-Type G", "Armored Vehicle Battle: LAV-Type G Custom", "Attack Chopper Battle: Mi-24A Custom", "Attack Chopper Battle: Mi-24D", "Attack Chopper Battle: Mi-24D Custom", "Attack Chopper Battle: AH56A-Bomber", "Attack Chopper Battle: AH56A-Bomber Custom", "Attack Chopper Battle: AH56A-Raider", "Attack Chopper Battle: AH56A-Raider Custom", "AI Weapon Battle: Pupa Type II", "AI Weapon Battle: Pupa Custom", "AI Weapon Battle: Chrysalis Type II", "AI Weapon Battle: Chrysalis Custom", "AI Weapon Battle: Cocoon Type II", "AI Weapon Battle: Cocoon Custom", "AI Weapon Battle: Peace Walker Type II", "AI Weapon Battle: Peace Walker Custom", "Metal Gear ZEKE - Mock Battle", "<<Hunting Quest: Rathalos>>", "<<Hunting Quest: Rathalos / Twilight>>", "<<Hunting Quest: Tigrex>>", "<<Hunting Quest: Tigrex / Twilight>>", "<<Hunting Quest: Gear REX>>", "<<Hunting Quest: Gear REX / Twilight>>", "Gear REX: Showdown at Crater Base", "Gear REX Strikes Back"]);

const BY_INTERNAL_ID=Object.create(null);

function add(category,ids,titles){
 for(let i=0;i<ids.length;i++){
  const number=i+1, internalId=ids[i], title=titles[i];
  BY_INTERNAL_ID[internalId]=Object.freeze({
   internalId,
   category,
   number,
   title,
   code: category==='extra' ? String(number).padStart(3,'0') : String(number).padStart(3,'0'),
   display: category==='extra' ? `[${String(number).padStart(3,'0')}] ${title}` : title
  });
 }
}
add('main',MAIN_INTERNAL_IDS_BY_NUMBER,MAIN_TITLES);
add('extra',EXTRA_INTERNAL_IDS_BY_NUMBER,EXTRA_TITLES);
Object.freeze(BY_INTERNAL_ID);

function resolveInternalId(id){
 return BY_INTERNAL_ID[Number(id)]||null;
}

global.PWSEMissionLookups=Object.freeze({
 MAIN_INTERNAL_IDS_BY_NUMBER,
 EXTRA_INTERNAL_IDS_BY_NUMBER,
 MAIN_TITLES,
 EXTRA_TITLES,
 BY_INTERNAL_ID,
 resolveInternalId
});
})(window);
