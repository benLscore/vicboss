// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Overview fields and opt-in profile name editing. */
(function(global){
'use strict';

let save=null;
let exportedName="";
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
 exportedName=save?.overview.profileName||'';
 save?.setProfileNameEditing(true);
 syncNameControl();
 render();
}

function syncNameControl(){
 const enabled=Boolean(save);
 const panel=$('profile-name-editor'),input=$('profile-name-input');
 if(panel)panel.hidden=false;
 if(input){input.disabled=!enabled;input.value=save?.overview.profileName||'';}
}
function flushPendingEdits(){
 // Valid names commit immediately; blank drafts revert to the current name.
 const input=$('profile-name-input');
 if(input&&save)input.value=save.overview.profileName;
}
$('profile-name-input')?.addEventListener('input',()=>{
 const input=$('profile-name-input');
 if(!save||input.disabled)return;
 const caret=input.selectionStart;
 const clean=part=>part.replace(/[^a-zA-Z0-9 !"$&()\-= _+\[\];:'@#,./?]/g,'').toUpperCase();
 const nextCaret=clean(input.value.slice(0,caret)).length;
 input.value=clean(input.value).slice(0,15);
 input.setSelectionRange(Math.min(nextCaret,15),Math.min(nextCaret,15));
 if(!input.value.trim())return;
 save.updateProfileName(input.value);
 render();
 global.dispatchEvent(new Event('vicboss:profile-changed'));
});
$('profile-name-input')?.addEventListener('blur',flushPendingEdits);
function createCheckpoint(){const previous=save,previousName=exportedName;return ()=>{save=previous;exportedName=previousName;};}

global.PWSEOverviewUI=Object.freeze({createCheckpoint,setSave,render,flushPendingEdits,
 hasUnexportedChanges(){return Boolean(save&&save.overview.profileName!==exportedName);},
 markExported(){exportedName=save?.overview.profileName||'';}
});
})(window);
