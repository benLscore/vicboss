// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
PWSE Overview UI v0.1

Read-only wiring for save.overview.

Two integration modes:
1) If you add your own elements with the IDs below, this script populates them.
2) If those elements do not exist, it falls back to a readable text summary in
   the existing <pre id="overview-result"> used by the current PWSE frontend.

Custom element IDs:
  overview-profile-name
  overview-last-mission
  overview-save-date
  overview-save-time
  overview-play-time
  overview-heroism
  overview-camaraderie
  overview-gmp
*/
(function(global){
'use strict';

let save=null;
const $=id=>document.getElementById(id);

function numberText(v){
 return Number(v).toLocaleString('en-US');
}

function values(o){
 return {
  profileName:o.profileName,
  lastMission:o.lastMission.display,
  saveDate:o.savedAt.displayDate,
  saveTime:o.savedAt.displayTime,
  playTime:o.playTime.display,
  heroism:numberText(o.heroism),
  camaraderie:numberText(o.camaraderie),
  gmp:numberText(o.gmp)
 };
}

function setText(id,value){
 const el=$(id);
 if(el)el.textContent=value;
 return !!el;
}

function renderCustom(o){
 const v=values(o);
 let hits=0;
 hits+=setText('overview-profile-name',v.profileName);
 hits+=setText('overview-last-mission',v.lastMission);
 hits+=setText('overview-save-date',v.saveDate);
 hits+=setText('overview-save-time',v.saveTime);
 hits+=setText('overview-play-time',v.playTime);
 hits+=setText('overview-heroism',v.heroism);
 hits+=setText('overview-camaraderie',v.camaraderie);
 hits+=setText('overview-gmp',v.gmp);
 return hits>0;
}

function renderFallback(o){
 const target=$('overview-result');
 if(!target)return;
 const v=values(o);
 target.textContent=[
  `NAME              ${v.profileName}`,
  '',
  `LAST MISSION      ${v.lastMission}`,
  `SAVED             ${v.saveDate}  ${v.saveTime}`,
  `PLAY TIME         ${v.playTime}`,
  '',
  `HEROISM           ${v.heroism}`,
  `CAMARADERIE       ${v.camaraderie}`,
  `GMP               ${v.gmp}`
 ].join('\n');
}

function render(){
 if(!save)return;
 const o=save.overview;
 if(!renderCustom(o))renderFallback(o);

 const validation=$('validation');
 if(validation){
  const mirrorWarning=o.lastMission.mirrorsConsistent
   ? ''
   : '\nWARNING: last-mission mirror values do not match the primary field.';
  // Preserve the existing validation section while adding only a useful
  // last-mission consistency warning when necessary.
  if(mirrorWarning&&!validation.textContent.includes('last-mission mirror')){
   validation.textContent+=mirrorWarning;
  }
 }
}

function setSave(newSave){
 save=newSave;
 render();
}

global.PWSEOverviewUI=Object.freeze({setSave,render});
})(window);
