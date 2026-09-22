// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Read-only overview fields from the loaded save. */
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
}

function renderCustom(o){
 const v=values(o);
 setText('overview-profile-name',v.profileName);
 setText('overview-last-mission',v.lastMission);
 setText('overview-save-date',v.saveDate);
 setText('overview-save-time',v.saveTime);
 setText('overview-play-time',v.playTime);
 setText('overview-heroism',v.heroism);
 setText('overview-camaraderie',v.camaraderie);
 setText('overview-gmp',v.gmp);
}

function render(){
 if(save)renderCustom(save.overview);
}

function setSave(newSave){
 save=newSave;
 render();
}

global.PWSEOverviewUI=Object.freeze({setSave,render});
})(window);
