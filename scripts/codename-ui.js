// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* PWSE read-only codename UI v0.4. No styling or save writes. */
(function(global){
"use strict";
let save=null;
const $=id=>document.getElementById(id);
const stars=rank=>rank>0?"★".repeat(rank):"-";
const number=n=>n.toLocaleString();
function text(id,value){const el=$(id);if(el)el.textContent=value;}
function rows(id,data){
 const body=$(id);if(!body)return;
 body.replaceChildren();
 for(const values of data){
  const tr=document.createElement("tr");
  for(const value of values){const td=document.createElement("td");td.textContent=String(value);tr.appendChild(td);}
  body.appendChild(tr);
 }
}
const scalarIds=["codename-outcome-branch","codename-lethal-total","codename-nonlethal-total",
 "codename-dominant-types","codename-solo-candidates","codename-coop-candidates",
 "codename-balanced","codename-balance-summary","codename-heroism","codename-camaraderie",
 "codename-chapter4","codename-missions-completed",
 "codename-missions-solo","codename-missions-coop","codename-missions-percent","codename-missions-remaining"];
const tableIds=["codename-counter-rows","codename-owned-rows","codename-progress-rows",
 "codename-elite-rows"];
function render(){
 const t=save?.codenameTracker;
 if(!t){
  scalarIds.forEach(id=>text(id,"-"));tableIds.forEach(id=>rows(id,[]));return;
 }
 text("codename-outcome-branch",t.outcome.branch==="non-lethal"?"Non-lethal":"Lethal");
 text("codename-lethal-total",number(t.outcome.lethal));
 text("codename-nonlethal-total",number(t.outcome.nonLethal));
 text("codename-dominant-types",t.candidates.dominantWeaponTypes.map(key=>t.weaponTypes.find(x=>x.key===key)?.label||key).join(", "));
 for(const [mode,id] of [["Solo","codename-solo-candidates"],["CO-OPS","codename-coop-candidates"]]){
  text(id,t.candidateProgress.filter(x=>x.mode===mode).map(x=>x.name).join(", ")||"None");
 }
 text("codename-camaraderie",number(t.camaraderie));
 text("codename-heroism",number(t.heroism));
 text("codename-chapter4",t.missions.chapter4Complete?"Complete":"Incomplete");
 text("codename-missions-solo",number(t.missions.completedSP));
 text("codename-missions-coop",number(t.missions.completedCoop));
 text("codename-missions-completed",`${t.missions.completedSlots} / ${t.missions.requiredSlots}`);
 text("codename-missions-percent",`${t.missions.percent.toFixed(2)}%`);
 text("codename-missions-remaining",number(t.missions.remainingSlots));
 const weapons=t.groups.flatMap(group=>group.typeIds.map(id=>{
  const w=t.weaponTypes.find(x=>x.id===id);
  return [w.label,group.label,number(w.lethal),number(w.nonLethal),number(w.total)];
 }));
 // Retain visibility if the normally hidden internal counter is ever nonzero.
 const internal=t.weaponTypes.find(x=>x.group===null);
 if(internal?.total)weapons.push([internal.label,"Unclassified",number(internal.lethal),number(internal.nonLethal),number(internal.total)]);
 rows("codename-counter-rows",weapons);
 rows("codename-owned-rows",t.codenames.map(x=>[x.name,x.acquired?stars(x.rank):"-",x.acquired?"Yes":"No"]));
 rows("codename-progress-rows",t.candidateProgress.map(x=>[
  x.mode,x.name,stars(x.storedRank),stars(x.nextRank),
  !x.nextRank?"Highest rank already obtained":x.requirements.join("; ")||"Requirements met - ready to earn in-game"
 ]));
 text("codename-balanced",t.balance.balanced?"Yes":"No");
 text("codename-balance-summary",t.balance.balanced?"All 11 weapon types are balanced":
  t.balance.totalUsage===0?"No recorded weapon usage":`${t.balance.withinTargetCount} of 11 weapon types are within the current balance range`);
 rows("codename-elite-rows",t.eliteProgress.map(x=>{
  const pointers=[];
  if(!t.balance.balanced)pointers.push("Balance all 11 weapon types");
  if(t.outcome.branch!==x.branch)pointers.push(`Use more ${x.branch} takedowns`);
  pointers.push(...x.nextRankRequirements);
  return [x.name,x.mode,stars(x.storedRank),stars(x.nextRank),
   !x.nextRank?"Highest rank already obtained":pointers.join("; ")||"Requirements met - ready to earn in-game"];
 }));
}
function setSave(next){save=next||null;render();}
global.PWSECodenameUI=Object.freeze({setSave,render});
})(window);
