// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
PWSE read-only codename tracker v0.4

The save mirrors the runtime state at file offset +0x44. Counter banks and
codename bytes are taken from the reverse-engineered live tracker v7.

Displayed range totals are convenient summaries. The game's family selection
uses the highest INDIVIDUAL weapon type, so predictions retain per-type data.
*/
(function (global) {
    "use strict";

    const STATE_FILE_OFFSET = 0x44;
    const STAT_BASE = 0x524C;
    const STAT_STRIDE = 0x28;
    const STAT_VALUE = 0x10;
    const CODENAME_BASE = STATE_FILE_OFFSET + 0x1BFF1;
    const MISSION_SP_BASE = STATE_FILE_OFFSET + 0x32B4;
    const MISSION_COOP_BASE = STATE_FILE_OFFSET + 0x46F4;
    const REQUIRED_MODE_SLOTS = 295;

    const USER_MISSION_IDS = Object.freeze([
        1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,
        24,25,26,27,28,29,30,31,32,33,34,36,37,38,40,41,42,43,44,45,46,47,48,49,50,
        52,53,54,55,56,57,59,61,65,67,68,71,72,73,77,78,81,83,84,85,86,88,89,92,93,
        99,103,105,108,109,110,111,112,115,118,128,129,130,131,132,133,138,140,147,
        148,153,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,
        172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,
        191,192,193,194,195,196,197,198,201,202,203,204,205,206,207,208,209,210,212,
        217,218,219,221,222,225,226,227,228,229,230,231,232
    ]);
    const RANKLESS = new Set([0x1B, 0x9F, 0xA1]);

    const CODENAME_NAMES = Object.freeze([
        null,"ANT","BEAR","BEE","BUTTERFLY","CAT","DEER","DOBERMAN","FIREFLY",
        "FOX","FOXHOUND","GULL","HAWK","HOUND","KANGAROO","OCTOPUS","ORCA",
        "PIRANHA","PUMA","RAVEN","SCORPION","SWALLOW","WHALE","WOLF","EEL"
    ]);

    const TYPES = Object.freeze([
        {id:0,key:"cqc",label:"CQC",group:"cqc"},
        {id:1,key:"stunRod",label:"Stun Rod",group:"stunRod"},
        {id:2,key:"handgun",label:"Handgun",group:"short"},
        {id:3,key:"assaultRifle",label:"Assault Rifle",group:"medium"},
        {id:4,key:"sniperRifle",label:"Sniper Rifle",group:"long"},
        {id:5,key:"machineGun",label:"Machine Gun",group:"medium"},
        {id:6,key:"smg",label:"Submachine Gun",group:"short"},
        {id:7,key:"shotgun",label:"Shotgun",group:"short"},
        {id:8,key:"missile",label:"Missile Launcher",group:"explosives"},
        {id:9,key:"thrown",label:"Thrown/Grenade",group:"explosives"},
        {id:10,key:"internal",label:"Reserved/Internal",group:null},
        {id:11,key:"placeable",label:"Placeable/Trap",group:"explosives"}
    ]);
    const GROUPS = Object.freeze([
        {key:"short",label:"Short-range",typeIds:[2,6,7]},
        {key:"medium",label:"Medium-range",typeIds:[3,5]},
        {key:"long",label:"Long-range",typeIds:[4]},
        {key:"explosives",label:"Explosives",typeIds:[8,9,11]},
        {key:"cqc",label:"CQC",typeIds:[0]},
        {key:"stunRod",label:"Stun Rod",typeIds:[1]}
    ]);
    const NORMAL_TYPE_IDS = Object.freeze([0,1,2,3,4,5,6,7,8,9,11]);
    const COOP_CODENAMES = new Set([
        "ANT","BEE","DEER","DOBERMAN","FIREFLY","FOXHOUND","GULL",
        "KANGAROO","PIRANHA","RAVEN","WHALE","WOLF"
    ]);
    const ELITE_CODENAMES = new Set(["DOBERMAN","FOX","FOXHOUND","HOUND"]);
    const CAMARADERIE_MIN = Object.freeze([0,10001,50001,100001,200001,500001]);
    const CAMARADERIE_MAX = Object.freeze([0,10000,50000,100000,200000,500000]);
    const ELITE_HEROISM_MIN = Object.freeze([0,10001,50001,100001,150001,250001]);

    function u16(b,o){return (b[o]|(b[o+1]<<8))>>>0;}
    function u32(b,o){return (b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0;}
    function freezeArray(a){return Object.freeze(a.map(v=>Object.freeze(v)));}
    function statOffset(id){return STATE_FILE_OFFSET+STAT_BASE+id*STAT_STRIDE+STAT_VALUE;}
    function statValue(b,id){return u32(b,statOffset(id));}
    function missionResult(b,coop,id){return u16(b,(coop?MISSION_COOP_BASE:MISSION_SP_BASE)+id*2);}

    function readWeaponTypes(b){
        return freezeArray(TYPES.map(type=>{
            const lethal=statValue(b,221+type.id);
            const incap=statValue(b,234+type.id);
            const tranq=statValue(b,247+type.id);
            const stun=statValue(b,260+type.id);
            const nonLethal=incap+tranq+stun;
            return {...type,lethal,nonLethal,total:lethal+nonLethal,
                raw:Object.freeze({incapacitation:incap,tranquilization:tranq,stun})};
        }));
    }

    function readGroups(types){
        const byId=new Map(types.map(type=>[type.id,type]));
        return freezeArray(GROUPS.map(group=>{
            const members=group.typeIds.map(id=>byId.get(id));
            const lethal=members.reduce((n,type)=>n+type.lethal,0);
            const nonLethal=members.reduce((n,type)=>n+type.nonLethal,0);
            return {...group,lethal,nonLethal,total:lethal+nonLethal,
                componentTypes:Object.freeze(members.map(type=>type.key))};
        }));
    }

    function readOutcome(types){
        const lethal=types.reduce((n,type)=>n+type.lethal,0);
        const nonLethal=types.reduce((n,type)=>n+type.nonLethal,0);
        const score=nonLethal-2*lethal;
        return Object.freeze({lethal,nonLethal,total:lethal+nonLethal,
            discriminatorScore:score,branch:score>0?"non-lethal":"lethal"});
    }

    function familyCandidates(types,outcome,balanced){
        const normal=types.filter(type=>NORMAL_TYPE_IDS.includes(type.id));
        const max=Math.max(...normal.map(type=>type.total));
        const leaders=normal.filter(type=>type.total===max);
        const ids=new Set(leaders.map(type=>type.id));
        const solo=[],coop=[];
        const add=(a,b)=>{if(!solo.includes(a))solo.push(a);if(!coop.includes(b))coop.push(b);};
        if(outcome.branch==="non-lethal"){
            if(ids.has(0))add("BEAR","KANGAROO");
            if(ids.has(1))add("EEL","FIREFLY");
            if(ids.has(2)||ids.has(6)||ids.has(7))add("BUTTERFLY","ANT");
            if(ids.has(3)||ids.has(5))add("CAT","DEER");
            if(ids.has(4))add("SWALLOW","GULL");
            if(ids.has(8)||ids.has(9)||ids.has(11))add("OCTOPUS","WHALE");
            if(balanced)add("FOX","FOXHOUND");
        }else{
            if(ids.has(2)||ids.has(6)||ids.has(7))add("SCORPION","BEE");
            if(ids.has(3)||ids.has(5))add("PUMA","WOLF");
            if(ids.has(4))add("HAWK","RAVEN");
            if(ids.has(8)||ids.has(9)||ids.has(11))add("ORCA","PIRANHA");
            if(balanced)add("HOUND","DOBERMAN");
        }
        return Object.freeze({maximumIndividualUsage:max,
            dominantWeaponTypes:Object.freeze(leaders.map(type=>type.key)),
            solo:Object.freeze(solo),coop:Object.freeze(coop)});
    }

    function balance(types){
        const totalAll=types.reduce((n,type)=>n+type.total,0);
        const average=totalAll/11;
        const normal=types.filter(type=>NORMAL_TYPE_IDS.includes(type.id));
        const lowerBound=average*0.90,upperBound=average*1.10;
        const typeStatus=freezeArray(normal.map(type=>({
            id:type.id,key:type.key,label:type.label,total:type.total,
            status:type.total<lowerBound?"low":type.total>upperBound?"high":"within"
        })));
        const outsideTypes=Object.freeze(typeStatus.filter(type=>type.status!=="within"));
        const balanced=average>0&&outsideTypes.length===0;
        return Object.freeze({balanced,average,totalUsage:totalAll,
            lowerBound,upperBound,withinTargetCount:typeStatus.length-outsideTypes.length,
            typeStatus,outsideTypes,reservedInternalUsage:types[10].total});
    }

    function readCodenames(b){
        return freezeArray(CODENAME_NAMES.slice(1).map((name,i)=>{
            const id=i+1,raw=b[CODENAME_BASE+i]>>>0;
            return {id,name,raw,acquired:(raw&1)!==0,isNew:(raw&2)!==0,rank:(raw>>>2)&7};
        }));
    }

    function missionGrade(result){
        if(result===0)return "S";if(result===1)return "A";if(result===2)return "B";
        if(result===3)return "C";if(result===4)return "U";return "?";
    }
    function readMissions(b){
        const out={userMissionCount:USER_MISSION_IDS.length,requiredSlots:REQUIRED_MODE_SLOTS,
            completedSlots:0,completedSP:0,completedCoop:0,missionsWithAnyCompletion:0,
            allComplete:false,allA:true,allS:true,belowA:0,belowS:0,
            grades:{S:0,A:0,B:0,C:0,U:0,other:0}};
        for(const id of USER_MISSION_IDS){
            let any=false;
            for(const coop of [false,true]){
                const result=missionResult(b,coop,id);
                if(result===0xFFFF)continue;
                any=true;out.completedSlots++;if(coop)out.completedCoop++;else out.completedSP++;
                if(RANKLESS.has(id))continue;
                const grade=missionGrade(result);
                if(Object.prototype.hasOwnProperty.call(out.grades,grade))out.grades[grade]++;
                else out.grades.other++;
                if(result!==0&&result!==4){out.allS=false;out.belowS++;if(result!==1){out.allA=false;out.belowA++;}}
            }
            if(any)out.missionsWithAnyCompletion++;
        }
        out.allComplete=out.completedSlots>=out.requiredSlots;
        if(!out.allComplete){out.allA=false;out.allS=false;}
        if(out.allS)out.allA=true;
        out.fraction=out.completedSlots/out.requiredSlots;
        out.percent=out.fraction*100;
        out.remainingSlots=Math.max(0,out.requiredSlots-out.completedSlots);
        out.chapter4Complete=missionResult(b,false,27)!==0xFFFF||missionResult(b,true,27)!==0xFFFF;
        out.grades=Object.freeze(out.grades);
        return Object.freeze(out);
    }

    function missionEligible(name,rank,missions){
        if(ELITE_CODENAMES.has(name)&&rank<=2){
            return missions.chapter4Complete&&missions.fraction>0.50;
        }
        if(rank===1)return missions.fraction>0.05;
        if(rank===2)return missions.fraction>0.50;
        if(rank===3)return missions.allComplete;
        if(rank===4)return missions.allComplete&&missions.allA;
        return missions.allComplete&&missions.allS;
    }

    function rankEligible(name,rank,missions,camaraderie,heroism){
        if(!missionEligible(name,rank,missions))return false;
        if(COOP_CODENAMES.has(name)){
            if(camaraderie<CAMARADERIE_MIN[rank])return false;
        }else if(camaraderie>CAMARADERIE_MAX[rank])return false;
        return !ELITE_CODENAMES.has(name)||heroism>=ELITE_HEROISM_MIN[rank];
    }

    function eligibleRank(name,missions,camaraderie,heroism){
        let rank=0;
        for(let next=1;next<=5;next++){
            if(rankEligible(name,next,missions,camaraderie,heroism))rank=next;
        }
        return rank;
    }

    function rankRequirements(name,rank,missions,camaraderie,heroism){
        const requirements=[];
        if(ELITE_CODENAMES.has(name)&&rank<=2){
            if(!missions.chapter4Complete)requirements.push("Complete Chapter 4");
            const needed=Math.max(0,Math.floor(REQUIRED_MODE_SLOTS*0.50)+1-missions.completedSlots);
            if(needed)requirements.push(`Complete ${needed} more mission slot${needed===1?"":"s"}`);
        }else if(rank===1){
            const needed=Math.max(0,Math.floor(REQUIRED_MODE_SLOTS*0.05)+1-missions.completedSlots);
            if(needed)requirements.push(`Complete ${needed} more mission slot${needed===1?"":"s"}`);
        }else if(rank===2){
            const needed=Math.max(0,Math.floor(REQUIRED_MODE_SLOTS*0.50)+1-missions.completedSlots);
            if(needed)requirements.push(`Complete ${needed} more mission slot${needed===1?"":"s"}`);
        }else{
            if(missions.remainingSlots)requirements.push(`Complete ${missions.remainingSlots} more mission slot${missions.remainingSlots===1?"":"s"}`);
            if(rank===4&&missions.belowA)requirements.push(`Raise ${missions.belowA} completed slot${missions.belowA===1?"":"s"} to A or S`);
            if(rank===5&&missions.belowS)requirements.push(`Raise ${missions.belowS} completed slot${missions.belowS===1?"":"s"} to S`);
        }
        if(COOP_CODENAMES.has(name)){
            const needed=Math.max(0,CAMARADERIE_MIN[rank]-camaraderie);
            if(needed)requirements.push(`Gain ${needed.toLocaleString()} Camaraderie`);
        }else if(camaraderie>CAMARADERIE_MAX[rank]){
            requirements.push(`Solo Camaraderie ceiling exceeded by ${(camaraderie-CAMARADERIE_MAX[rank]).toLocaleString()}`);
        }
        if(ELITE_CODENAMES.has(name)){
            const needed=Math.max(0,ELITE_HEROISM_MIN[rank]-heroism);
            if(needed)requirements.push(`Gain ${needed.toLocaleString()} Heroism`);
        }
        return Object.freeze(requirements);
    }

    function candidateProgress(candidates,codenames,missions,camaraderie,heroism){
        const byName=new Map(codenames.map(code=>[code.name,code]));
        const rows=[];
        for(const [mode,names] of [["Solo",candidates.solo],["CO-OPS",candidates.coop]]){
            for(const name of names){
                if(ELITE_CODENAMES.has(name))continue;
                const stored=byName.get(name);
                const eligible=eligibleRank(name,missions,camaraderie,heroism);
                const storedRank=stored?.acquired?stored.rank:0;
                const nextRank=storedRank<5?storedRank+1:null;
                rows.push(Object.freeze({name,mode,storedRank,
                    acquired:!!stored?.acquired,eligibleRank:eligible,nextRank,
                    requirements:nextRank?rankRequirements(name,nextRank,missions,camaraderie,heroism):Object.freeze([])}));
            }
        }
        return Object.freeze(rows);
    }

    function rankOverview(missions,camaraderie){
        const labels=[null,
            "More than 5% of required mission slots complete",
            "More than 50% of required mission slots complete",
            "All required mission slots complete",
            "All required mission slots at A or S",
            "All required mission slots at S"
        ];
        return freezeArray([1,2,3,4,5].map(rank=>{
            const missionMet=missionEligible("PUMA",rank,missions);
            const soloMet=camaraderie<=CAMARADERIE_MAX[rank];
            const coopMet=camaraderie>=CAMARADERIE_MIN[rank];
            return {rank,missionRequirement:labels[rank],missionMet,
                soloCamaraderieMax:CAMARADERIE_MAX[rank],soloCamaraderieMet:soloMet,
                coopCamaraderieMin:CAMARADERIE_MIN[rank],coopCamaraderieMet:coopMet,
                soloEligible:missionMet&&soloMet,coopEligible:missionMet&&coopMet};
        }));
    }

    function eliteProgress(codenames,missions,camaraderie,heroism,balanceResult,outcome){
        const byName=new Map(codenames.map(code=>[code.name,code]));
        const nonLethalNeeded=outcome.discriminatorScore>0?0:1-outcome.discriminatorScore;
        const lethalNeeded=outcome.discriminatorScore>0?Math.ceil(outcome.discriminatorScore/2):0;
        const definitions=[
            {name:"FOX",mode:"Solo",branch:"non-lethal"},
            {name:"HOUND",mode:"Solo",branch:"lethal"},
            {name:"FOXHOUND",mode:"CO-OPS",branch:"non-lethal"},
            {name:"DOBERMAN",mode:"CO-OPS",branch:"lethal"}
        ];
        return freezeArray(definitions.map(def=>{
            const stored=byName.get(def.name);
            const progressRank=eligibleRank(def.name,missions,camaraderie,heroism);
            const storedRank=stored?.acquired?stored.rank:0;
            const nextRank=storedRank<5?storedRank+1:null;
            const familyBlockers=[];
            if(!balanceResult.balanced){
                familyBlockers.push(`Balance weapon usage (${balanceResult.outsideTypes.length} of 11 types outside the target range)`);
            }
            if(outcome.branch!==def.branch){
                const needed=def.branch==="non-lethal"?nonLethalNeeded:lethalNeeded;
                familyBlockers.push(`Switch to the ${def.branch} branch (at least ${needed.toLocaleString()} matching takedowns)`);
            }
            const familyMatched=familyBlockers.length===0;
            return {...def,storedRank,acquired:!!stored?.acquired,
                familyMatched,progressRank,currentlyEligibleRank:familyMatched?progressRank:0,
                familyBlockers:Object.freeze(familyBlockers),nextRank,
                nextRankRequirements:nextRank?rankRequirements(def.name,nextRank,missions,camaraderie,heroism):Object.freeze([])};
        }));
    }

    function familyGuidance(types,outcome,candidates){
        const byId=new Map(types.map(type=>[type.id,type]));
        const maximum=candidates.maximumIndividualUsage;
        const nonLethalNeeded=outcome.discriminatorScore>0?0:1-outcome.discriminatorScore;
        const lethalNeeded=outcome.discriminatorScore>0?Math.ceil(outcome.discriminatorScore/2):0;
        const definitions=[
            {group:"short",label:"Short-range",ids:[2,6,7],branch:"non-lethal",solo:"BUTTERFLY",coop:"ANT"},
            {group:"short",label:"Short-range",ids:[2,6,7],branch:"lethal",solo:"SCORPION",coop:"BEE"},
            {group:"medium",label:"Medium-range",ids:[3,5],branch:"non-lethal",solo:"CAT",coop:"DEER"},
            {group:"medium",label:"Medium-range",ids:[3,5],branch:"lethal",solo:"PUMA",coop:"WOLF"},
            {group:"long",label:"Long-range",ids:[4],branch:"non-lethal",solo:"SWALLOW",coop:"GULL"},
            {group:"long",label:"Long-range",ids:[4],branch:"lethal",solo:"HAWK",coop:"RAVEN"},
            {group:"explosives",label:"Explosives",ids:[8,9,11],branch:"non-lethal",solo:"OCTOPUS",coop:"WHALE"},
            {group:"explosives",label:"Explosives",ids:[8,9,11],branch:"lethal",solo:"ORCA",coop:"PIRANHA"},
            {group:"cqc",label:"CQC",ids:[0],branch:"non-lethal",solo:"BEAR",coop:"KANGAROO"},
            {group:"stunRod",label:"Stun Rod",ids:[1],branch:"non-lethal",solo:"EEL",coop:"FIREFLY"}
        ];
        const current=new Set([...candidates.solo,...candidates.coop]);
        const rows=definitions.map(def=>{
            const members=def.ids.map(id=>byId.get(id));
            const best=Math.max(...members.map(type=>type.total));
            const usageNeeded=Math.max(0,maximum-best);
            const outcomeNeeded=def.branch==="non-lethal"?nonLethalNeeded:lethalNeeded;
            return Object.freeze({...def,bestIndividualUsage:best,usageNeeded,outcomeNeeded,
                minimumAdditionalTakedowns:Math.max(usageNeeded,outcomeNeeded),
                currentCandidate:current.has(def.solo)||current.has(def.coop)});
        });
        rows.sort((a,b)=>Number(b.currentCandidate)-Number(a.currentCandidate)||
            a.minimumAdditionalTakedowns-b.minimumAdditionalTakedowns||a.label.localeCompare(b.label));
        return Object.freeze(rows);
    }

    function parse(plain){
        if(!(plain instanceof Uint8Array)||plain.length<0x38878)throw Error("Invalid decrypted Peace Walker save data");
        const weaponTypes=readWeaponTypes(plain);
        const groups=readGroups(weaponTypes);
        const outcome=readOutcome(weaponTypes);
        const balanceResult=balance(weaponTypes);
        const candidates=familyCandidates(weaponTypes,outcome,balanceResult.balanced);
        const codenames=readCodenames(plain);
        const missions=readMissions(plain);
        const heroism=statValue(plain,0x77);
        const camaraderie=u32(plain,0x38874);
        return Object.freeze({
            groups,weaponTypes,outcome,balance:balanceResult,
            candidates,codenames,missions,heroism,camaraderie,
            candidateProgress:candidateProgress(candidates,codenames,missions,camaraderie,heroism),
            rankOverview:rankOverview(missions,camaraderie),
            eliteProgress:eliteProgress(codenames,missions,camaraderie,heroism,balanceResult,outcome),
            familyGuidance:familyGuidance(weaponTypes,outcome,candidates),
            notes:Object.freeze({
                groupedTotals:"Display totals combine weapon types, but codename family selection uses the highest individual weapon type.",
                nonLethal:"Non-lethal combines incapacitation, tranquilization and stun outcomes.",
                discriminator:"The evaluator takes non-lethal paths only when non-lethal minus twice lethal is greater than zero.",
                missionModes:"The 295-slot total is validated; this summary counts saved SP and CO-OPS results for the 161 validated mission IDs.",
                rankEligibility:"Mission gates prioritize the published guide, including Chapter 4 plus over 50% completion for early elite ranks.",
                camaraderieConfidence:"CONFIRMED by user testing: the save, live tracker and in-game counter report the same Total Camaraderie value.",
                guidance:"Alternative-family takedown counts are lower bounds based on the current save, individual weapon usage and outcome branch."
            })
        });
    }

    global.PWSECodenameTracker=Object.freeze({parse,constants:Object.freeze({
        STATE_FILE_OFFSET,STAT_BASE,STAT_STRIDE,STAT_VALUE,CODENAME_BASE,
        MISSION_SP_BASE,MISSION_COOP_BASE,REQUIRED_MODE_SLOTS,
        weaponTypes:TYPES,groups:GROUPS,userMissionIds:USER_MISSION_IDS
    })});
})(window);
