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
const scalarIds=["codename-grenade-launcher-kills","codename-outcome-branch","codename-lethal-total","codename-nonlethal-total",
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
 text("codename-grenade-launcher-kills",number(t.grenadeLauncherKills));
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
let changesSinceExport=false;
function editError(error){const n=document.getElementById('codename-edit-error');if(n){n.hidden=!error;n.textContent=error?error.message:'';}if(error)console.error(error);}
function commitCounter(input,finalise=false){
 if(!save||!save.codenameEditingEnabled||input.dataset.edited!=='true')return;
 if(input.value.trim()===''||!Number.isFinite(input.valueAsNumber)){
  if(finalise){
   const w=save.codenameTracker.weaponTypes.find(w=>w.id===Number(input.dataset.type));
   input.value=String(input.dataset.kind==='lethal'?w.lethal:w.raw[input.dataset.kind]);
   delete input.dataset.edited;
  }
  return;
 }
 const value=Math.max(0,Math.min(999999,Math.trunc(input.valueAsNumber)));
 input.value=String(value);
 try{
  const before=save.codenameTracker;
  save.updateCodenameCounter(Number(input.dataset.type),input.dataset.kind,value);
  if(before!==save.codenameTracker){changesSinceExport=true;render();global.dispatchEvent(new Event('vicboss:codenames-changed'));}
  delete input.dataset.edited;
  editError(null);
 }catch(error){editError(error);}
}
function flushPendingEdits(){document.querySelectorAll('#codename-edit-counters input').forEach(input=>commitCounter(input,true));}
function renderEditor(){
 const host=document.getElementById('codename-editor');if(!host)return;
 host.hidden=!save?.codenameEditingEnabled;
 const counters=document.getElementById('codename-edit-counters'),ranks=document.getElementById('codename-edit-ranks');
 counters.replaceChildren();ranks.replaceChildren();if(!save)return;
 for(const w of save.codenameTracker.weaponTypes.filter(w=>w.group!==null)){
  const row=document.createElement('tr'),label=document.createElement('th');label.scope='row';label.textContent=w.label;row.appendChild(label);
  for(const kind of ['lethal','incapacitation','tranquilization','stun']){
   const cell=document.createElement('td'),input=document.createElement('input');input.type='number';input.min='0';input.max='999999';input.step='1';input.style.width='8em';
   input.value=String(kind==='lethal'?w.lethal:w.raw[kind]);input.dataset.type=w.id;input.dataset.kind=kind;input.disabled=!save.codenameEditingEnabled;
   input.setAttribute('aria-label',w.label+' '+kind);input.addEventListener('input',()=>{input.dataset.edited='true';commitCounter(input);});input.addEventListener('blur',()=>commitCounter(input,true));cell.appendChild(input);row.appendChild(cell);
  }counters.appendChild(row);
 }
 for(const c of save.codenameTracker.codenames){
  const row=document.createElement('tr'),label=document.createElement('th'),cell=document.createElement('td'),select=document.createElement('select');label.scope='row';label.textContent=c.name;select.setAttribute('aria-label',c.name+' obtained rank');select.disabled=!save.codenameEditingEnabled;
  for(let i=0;i<=5;i++){const o=document.createElement('option');o.value=i;o.textContent=i?'Rank '+i:'Not obtained';select.appendChild(o);}
  if(c.acquired&&(c.rank<1||c.rank>5)){const o=document.createElement('option');o.value=c.rank;o.textContent='Existing rank '+c.rank+' (keep)';select.appendChild(o);}
  select.value=c.acquired?c.rank:0;
  select.addEventListener('change',()=>{try{save.updateCodenameRank(c.id,Number(select.value));changesSinceExport=true;render();global.dispatchEvent(new Event('vicboss:codenames-changed'));editError(null);}catch(e){editError(e);renderEditor();}});
  row.appendChild(label);cell.appendChild(select);row.appendChild(cell);ranks.appendChild(row);
 }
}
const editToggle=document.getElementById('enable-codename-editing');
if(editToggle){editToggle.checked=false;editToggle.addEventListener('change',()=>{flushPendingEdits();save?.setCodenameEditing(editToggle.checked);renderEditor();});}
function setSave(next){save=next||null;changesSinceExport=false;save?.setCodenameEditing(false);if(editToggle)editToggle.checked=false;editError(null);render();renderEditor();}
function createCheckpoint(){const previous=save,dirty=changesSinceExport;return ()=>{save=previous;changesSinceExport=dirty;};}

global.PWSECodenameUI=Object.freeze({createCheckpoint,setSave,render,flushPendingEdits,hasUnexportedChanges:()=>Boolean(save&&changesSinceExport),markExported:()=>{changesSinceExport=false;}});
})(window);
