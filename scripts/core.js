// THIS SCRIPT WAS CREATED USING GENERATIVE AI

(function(global){
'use strict';

// Vicboss Core — persistent staff editing + read-only Overview/codename parsers.
// Browser-only. No backend or external libraries.

const FILE_SIZE=0x4F950, MUL=0x02E90EDD;
const B1H=0x0,B1=0x40,B1SZ=0x387F0,B2H=0x38830,B2=0x38870,B2SZ=0xF0E0;
const CRC_L=0x30,CRC_M=0x38,CRC_A=0x3C,CRC_S=0x38864;
const MAIN=0x44,MAIN_SZ=0x1C17C,AUX=0x1C1C0,AUX_SZ=0x3800,LARGE=0x1F9C0,LARGE_SZ=0x18E68,SEC=0x38870,SEC_SZ=0xF0E0;
const SLOT=0x178,HEROISM=0x6538;
const OVERVIEW_O=Object.freeze({
 PLAY_SECONDS:0x00C8,
 SAVE_YEAR:0x017C,SAVE_MONTH:0x017E,SAVE_DAY:0x017F,SAVE_HOUR:0x0180,SAVE_MINUTE:0x0181,
 PROFILE_NAME:0x0188,PROFILE_NAME_LEN:16,
 LAST_MISSION:0x5288,LAST_MISSION_MIRROR1:0x1C228,LAST_MISSION_MIRROR2:0x1D728,
 TOTAL_GMP:0xB570,
 TOTAL_CAMARADERIE:0x38874
});

const STAFF_BASE=0x1FA80, STAFF_STRIDE=0xA0, STAFF_CAPACITY=350;
const O={
 SPEECH:0x10,TAG:0x18,NAME:0x20,LOCATION:0x30,TITLE:0x31,U32:0x32,ARCHETYPE:0x33,STATUS:0x34,U36:0x36,GMP:0x38,PORTRAIT:0x3C,
 LIFE_ORIGINAL:0x42,LIFE_CURRENT:0x44,LIFE_CEILING:0x46,
 PSY_ORIGINAL:0x4A,PSY_CURRENT:0x4C,PSY_CEILING:0x4E,
 RUN:0x52,WALK:0x54,FIGHT:0x56,SHOOT:0x58,RELOAD:0x5A,THROW:0x5C,PLACE:0x5E,DEFENSE:0x60,
 MESS:0x64,MESS2:0x66,MED:0x68,MED2:0x6A,RD:0x6C,RD2:0x6E,INTEL:0x70,INTEL2:0x72,
 WOUNDED:0x76,U78:0x78,SICK:0x7A,PTSD:0x7C,HOSTILITY:0x80,MORALE:0x82,U84:0x84,U86:0x86,
 PREV_LOCATION:0x8C,SKILL1:0x98,SKILL2:0x99,SKILL3:0x9A,SKILL4:0x9B
};

const LOCATION_NAMES=Object.freeze({1:'Waiting Room',2:'Combat Unit',3:'R&D Team',4:'Medical Team',5:'Mess Hall Team',6:'Intel Team',7:'Trade Waiting Room',8:'Brig',9:'Sickbay'});
const TAG_NAMES=Object.freeze({4:'UNQ',6:'POW',7:'VOL',8:'NML'});
const TITLE_NAMES=Object.freeze({3:'Commando',13:'Engineer',16:'Spy',22:'MSF Subcommander',87:'Game Designer'});
const SKILL_NAMES=Object.freeze({0x1B:'Gunsmith (Handguns)',0x2D:'Bird Watcher',0x2F:'Mother Base Deputy Commander'});

function u8(b,o){return b[o]>>>0}
function u16(b,o){return (b[o]|(b[o+1]<<8))>>>0}
function u32(b,o){return (b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0}
function p8(b,o,v){b[o]=v&255}
function p16(b,o,v){v>>>=0;b[o]=v&255;b[o+1]=(v>>>8)&255}
function p32(b,o,v){v>>>=0;b[o]=v&255;b[o+1]=(v>>>8)&255;b[o+2]=(v>>>16)&255;b[o+3]=(v>>>24)&255}
function derive(b,h){const w=[];for(let i=0;i<16;i++)w.push(u32(b,h+i*4));const idx=(((w[1]|0xAD47DE8F)^w[0])>>>0);if(idx>8)throw Error('Unexpected LCG key index '+idx);const p1=(w[idx+2]^0x1327DE73)>>>0,p2=(w[idx+3]^0x2D71D26C)>>>0,p3=(w[idx+7]^0xBC4DEFA2)>>>0,x=(p1^p2)>>>0;return {state:((((x^0x6576)<<16)|x)>>>0),inc:Math.imul(x,p3)>>>0}}
function crypt(b,o,n,state,inc){for(let p=o;p<o+n;p+=4){p32(b,p,(u32(b,p)^state)>>>0);state=(Math.imul(state,MUL)+inc)>>>0}}
function decrypt(raw){const b=new Uint8Array(raw);if(b.length!==FILE_SIZE)throw Error(`Expected ${FILE_SIZE} bytes, got ${b.length}`);const r=new Uint8Array(b);let k=derive(r,B1H);crypt(r,B1,B1SZ,k.state,k.inc);k=derive(r,B2H);crypt(r,B2,B2SZ,k.state,k.inc);return r}
function encrypt(plain){const r=new Uint8Array(plain);let k=derive(r,B1H);crypt(r,B1,B1SZ,k.state,k.inc);k=derive(r,B2H);crypt(r,B2,B2SZ,k.state,k.inc);return r}
const CT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?((0xEDB88320^(c>>>1))>>>0):(c>>>1);t[n]=c>>>0}return t})();
function crc32(b,o,n){let c=0xFFFFFFFF;for(let i=o;i<o+n;i++)c=(CT[(c^b[i])&255]^(c>>>8))>>>0;return (c^0xFFFFFFFF)>>>0}
function calcCrcs(b){return {main:crc32(b,MAIN,MAIN_SZ),aux:crc32(b,AUX,AUX_SZ),large:crc32(b,LARGE,LARGE_SZ),secondary:crc32(b,SEC,SEC_SZ)}}
function storedCrcs(b){return {main:u32(b,CRC_M),aux:u32(b,CRC_A),large:u32(b,CRC_L),secondary:u32(b,CRC_S)}}
function repairCrcs(b){const c=calcCrcs(b);p32(b,CRC_M,c.main);p32(b,CRC_A,c.aux);p32(b,CRC_L,c.large);p32(b,CRC_S,c.secondary);return c}
function crcReport(b){const s=storedCrcs(b),c=calcCrcs(b),r={};for(const k of ['main','aux','large','secondary'])r[k]={stored:s[k],calculated:c[k],valid:s[k]===c[k]};return r}
function equal(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
function xor16(b){let x=0xFFFF;for(let i=0;i<b.length;i+=2)x^=u16(b,i);return x&0xFFFF}
function prefix(name){return String(name||'').toUpperCase().startsWith('STJ')?'STJ':'STW'}
function outName(enc,slot,name){return `${prefix(name)}000000${xor16(enc).toString(16).padStart(4,'0')}${String(slot).padStart(2,'0')}`}

function hx(v,w=2){return Number(v).toString(16).toUpperCase().padStart(w,'0')}
function nameInfo(b,o){let text='',raw=[];for(let i=0;i<16;i++){const x=b[o+i];if(x===0)break;raw.push(x);text+=(x>=0x20&&x<=0x7E)?String.fromCharCode(x):`\\x${hx(x)}`;}return {text,bytesHex:raw.map(x=>hx(x)).join(' ')}}
function loc(code){return LOCATION_NAMES[code]||`Unknown (0x${hx(code)})`}
function tag(code){if(TAG_NAMES[code])return TAG_NAMES[code];if(code===5)return 'TRD? (candidate)';return `Unknown (0x${hx(code)})`}
function title(code){const mapped=global.PWSEStaffLookups?.TITLE_NAMES?.[code];return mapped||TITLE_NAMES[code]||`Unknown (0x${hx(code)})`}
function skill(code){if(code===0)return null;const mapped=global.PWSEStaffLookups?.SKILL_NAMES?.[code];return mapped||SKILL_NAMES[code]||`Unknown skill 0x${hx(code)}`}
function speechSelectorHex(b,o){let s='';for(let i=0;i<6;i++)s+=hx(u8(b,o+i));return s}
function descriptionGenderForSelectorHex(h){return global.PWSEStaffLookups?.DESCRIPTION_GENDER_BY_SELECTOR?.[h]||null}
function descriptionFromSelectorHex(h,gender){
 const mappedGender=descriptionGenderForSelectorHex(h);
 if(mappedGender&&gender&&mappedGender!==gender)return null;
 return global.PWSEStaffLookups?.DESCRIPTION_BY_SELECTOR?.[h]||null
}
function clamp(v,a,z){return Math.min(z,Math.max(a,v))}

// VERY STRONGLY SUPPORTED by controlled tests.
function medicalPercent(w,s,p){const m=[100];if(w>0)m.push(clamp(100-w,20,60));if(s>0)m.push(60);if(p>0)m.push(clamp(100-p,20,60));return Math.min(...m)}
function medicalDisplay(stored,pct){return Math.ceil(stored*pct/100)}
// STRONGLY SUPPORTED: raw 1..19 => 1; 20..29 => 2; 30 => 3; 50=>5; 90/99=>9.
function hostilityDisplay(raw){return raw===0?0:Math.max(1,Math.floor(raw/10))}
// VERY STRONGLY SUPPORTED positive morale boost.
function moraleMultiplier(m){return m<=500?1:(2500+(m-500))/2500}
function moraleFloor(v,m){return Math.floor(v*moraleMultiplier(m))}
function combatGrade(v){if(v<=0)return '-';if(v<250)return 'E';if(v<500)return 'D';if(v<750)return 'C';if(v<1000)return 'B';if(v<1250)return 'A';return 'S'}
// TESTED: each department at morale 0: 998 = A, 999 = S. Lower boundaries unchanged.
function deptGrade(v){if(v<=0)return '-';if(v<200)return 'E';if(v<400)return 'D';if(v<600)return 'C';if(v<800)return 'B';if(v<999)return 'A';return 'S'}


function pad2(v){return String(v).padStart(2,'0')}
function formatPlayTime(totalSeconds){
 totalSeconds=Number(totalSeconds)>>>0;
 const hours=Math.floor(totalSeconds/3600);
 const minutes=Math.floor((totalSeconds%3600)/60);
 const seconds=totalSeconds%60;
 return `${String(hours).padStart(2,'0')}:${pad2(minutes)}:${pad2(seconds)}`
}
function profileNameInfo(b){
 return nameInfo(b,OVERVIEW_O.PROFILE_NAME)
}
function missionInfo(internalId){
 const mapped=global.PWSEMissionLookups?.resolveInternalId?.(internalId)||null;
 if(mapped)return mapped;
 return Object.freeze({
  internalId,
  category:null,
  number:null,
  title:null,
  code:null,
  display:`Unknown mission (internal ID ${internalId})`
 })
}
function parseOverview(b){
 const profile=profileNameInfo(b);
 const playSeconds=u32(b,OVERVIEW_O.PLAY_SECONDS);
 const year=u16(b,OVERVIEW_O.SAVE_YEAR);
 const month=u8(b,OVERVIEW_O.SAVE_MONTH);
 const day=u8(b,OVERVIEW_O.SAVE_DAY);
 const hour=u8(b,OVERVIEW_O.SAVE_HOUR);
 const minute=u8(b,OVERVIEW_O.SAVE_MINUTE);
 const lastMissionId=u32(b,OVERVIEW_O.LAST_MISSION);
 const mirror1=u32(b,OVERVIEW_O.LAST_MISSION_MIRROR1);
 const mirror2=u32(b,OVERVIEW_O.LAST_MISSION_MIRROR2);
 const mission=missionInfo(lastMissionId);
 return Object.freeze({
  slot:u32(b,SLOT),
  profileName:profile.text,
  profileNameBytesHex:profile.bytesHex,
  lastMission:Object.freeze({
   internalId:lastMissionId,
   category:mission.category,
   number:mission.number,
   code:mission.code,
   title:mission.title,
   display:mission.display,
   mirrors:Object.freeze([mirror1,mirror2]),
   mirrorsConsistent:lastMissionId===mirror1&&lastMissionId===mirror2
  }),
  savedAt:Object.freeze({
   year,month,day,hour,minute,
   displayDate:`${pad2(month)}/${pad2(day)}/${String(year).padStart(4,'0')}`,
   displayTime:`${pad2(hour)}:${pad2(minute)}`
  }),
  playTime:Object.freeze({
   totalSeconds:playSeconds,
   hours:Math.floor(playSeconds/3600),
   minutes:Math.floor((playSeconds%3600)/60),
   seconds:playSeconds%60,
   display:formatPlayTime(playSeconds)
  }),
  heroism:u32(b,HEROISM),
  camaraderie:u32(b,OVERVIEW_O.TOTAL_CAMARADERIE),
  gmp:u32(b,OVERVIEW_O.TOTAL_GMP)
 })
}

function writeSavedAt(b,value){
 const d=value instanceof Date?new Date(value.getTime()):new Date(value);
 if(Number.isNaN(d.getTime()))throw Error('Invalid export date/time');
 const year=d.getFullYear();
 if(year<0||year>0xFFFF)throw Error('Export year is outside the save format range');
 p16(b,OVERVIEW_O.SAVE_YEAR,year);
 p8(b,OVERVIEW_O.SAVE_MONTH,d.getMonth()+1);
 p8(b,OVERVIEW_O.SAVE_DAY,d.getDate());
 p8(b,OVERVIEW_O.SAVE_HOUR,d.getHours());
 p8(b,OVERVIEW_O.SAVE_MINUTE,d.getMinutes());
 return Object.freeze({year,month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes()});
}

function isProtectedSpecialStaffData(tagCode,titleCode,name){
 return tagCode===0x04 || String(name||'').toUpperCase()==='HIDEO'
}
function specialStaffReason(tagCode,titleCode,name){
 if(tagCode===0x04)return 'Unique character';
 if(String(name||'').toUpperCase()==='HIDEO')return 'Hideo';
 return null
}
function parseStaffRecord(b,index){
 const base=STAFF_BASE+index*STAFF_STRIDE,n=nameInfo(b,base+O.NAME);if(!n.text)return null;
 const tagCode=u8(b,base+O.TAG),locationCode=u8(b,base+O.LOCATION),titleCode=u8(b,base+O.TITLE),status=u8(b,base+O.STATUS);
 const wounded=u16(b,base+O.WOUNDED),sick=u16(b,base+O.SICK),ptsd=u16(b,base+O.PTSD),hostilityRaw=u16(b,base+O.HOSTILITY),morale=u16(b,base+O.MORALE);
 const lp=u16(b,base+O.LIFE_CURRENT),pp=u16(b,base+O.PSY_CURRENT),medPct=medicalPercent(wounded,sick,ptsd);
 const combat=Object.freeze({runSpeed:u16(b,base+O.RUN),walkSpeed:u16(b,base+O.WALK),fight:u16(b,base+O.FIGHT),shoot:u16(b,base+O.SHOOT),reload:u16(b,base+O.RELOAD),throw:u16(b,base+O.THROW),place:u16(b,base+O.PLACE),defense:u16(b,base+O.DEFENSE)});
 // Stored/base values remain the editable source of truth.
 // Morale-adjusted values are derived live from those bases and are never written
 // back into the stored ability fields.
 const displayConditions={wounded,sick,ptsd,hostilityRaw};
 const effectiveAbility=v=>global.PWSEAbilityDisplay?.calculate(v,morale,displayConditions).effective ?? moraleFloor(v,morale);
 const combatDisplayValues={};const combatGrades={};
 for(const [k,v] of Object.entries(combat)){
  combatDisplayValues[k]=effectiveAbility(v);
  combatGrades[k]=combatGrade(combatDisplayValues[k]);
 }
 const departments=Object.freeze({mess:u16(b,base+O.MESS),medical:u16(b,base+O.MED),rd:u16(b,base+O.RD),intel:u16(b,base+O.INTEL)});
 const departmentDisplayValues={};const departmentGrades={};
 for(const [k,v] of Object.entries(departments)){
  departmentDisplayValues[k]=effectiveAbility(v);
  departmentGrades[k]=deptGrade(departmentDisplayValues[k]);
 }
 const sc=[u8(b,base+O.SKILL1),u8(b,base+O.SKILL2),u8(b,base+O.SKILL3),u8(b,base+O.SKILL4)];
 const prev=u8(b,base+O.PREV_LOCATION);
 const speechHex=speechSelectorHex(b,base+O.SPEECH);
 const speechBytes=Object.freeze(Array.from(b.slice(base+O.SPEECH,base+O.SPEECH+6)));
 const genderFlag=(status&1)?'Male':'Female';
 const quote=global.PWSEQuotes?.preview(u32(b,base+O.SPEECH),genderFlag);
 const speechMappedGender=quote ? null : descriptionGenderForSelectorHex(speechHex);
 return Object.freeze({
  index,fileOffset:base,largeRelativeOffset:base-LARGE,
  name:n.text,nameBytesHex:n.bytesHex,
  tag:Object.freeze({code:tagCode,label:tag(tagCode)}),
  location:Object.freeze({code:locationCode,label:loc(locationCode)}),
  previousLocation:Object.freeze({code:prev,label:prev===0?null:loc(prev)}),
  title:Object.freeze({code:titleCode,label:title(titleCode)}),
  description:Object.freeze({selectorHex:speechHex,selectorBytes:speechBytes,text:quote?.text ?? descriptionFromSelectorHex(speechHex,genderFlag),mappedGender:speechMappedGender,...(quote||{})}),
  portraitCode:u32(b,base+O.PORTRAIT),
  genderFlag,statusRaw:status,
  specialReadOnly:isProtectedSpecialStaffData(tagCode,titleCode,n.text),
  specialReadOnlyReason:specialStaffReason(tagCode,titleCode,n.text),
  outerOps:(status&0x80)!==0,medicallyUnavailableFlag:(status&0x08)!==0,dismissalRelatedFlag:(status&0x02)!==0,
  gmpBase:u32(b,base+O.GMP),
  life:Object.freeze({original:u16(b,base+O.LIFE_ORIGINAL),current:lp,ceilingCandidate:u16(b,base+O.LIFE_CEILING),displayedFromMedicalConditions:medicalDisplay(lp,medPct)}),
  psyche:Object.freeze({original:u16(b,base+O.PSY_ORIGINAL),current:pp,ceilingCandidate:u16(b,base+O.PSY_CEILING),displayedFromMedicalConditions:medicalDisplay(pp,medPct)}),
  combatAbilities:combat,
  combatAbilityDisplayValues:Object.freeze(combatDisplayValues),
  combatAbilityGrades:Object.freeze(combatGrades),
  departments,
  departmentDisplayValues:Object.freeze(departmentDisplayValues),
  departmentGrades:Object.freeze(departmentGrades),
  conditions:Object.freeze({
   wounded,sick,ptsd,hostilityRaw,
   hostilityDisplayLevel:hostilityDisplay(hostilityRaw),
   morale,
   moraleMultiplier:moraleMultiplier(morale),
   medicalPercent:medPct
  }),
  skills:Object.freeze(sc.map(code=>Object.freeze({code,label:skill(code)}))),
  experimentalRaw:Object.freeze({unknown32:u8(b,base+O.U32),archetype33Candidate:u8(b,base+O.ARCHETYPE),unknown36:u16(b,base+O.U36),unknown78:u16(b,base+O.U78),unknown84:u16(b,base+O.U84),unknown86:u16(b,base+O.U86),messSecondary:u16(b,base+O.MESS2),medicalSecondary:u16(b,base+O.MED2),rdSecondary:u16(b,base+O.RD2),intelSecondary:u16(b,base+O.INTEL2)})
 });
}
function parseStaff(b){const a=[];for(let i=0;i<STAFF_CAPACITY;i++){const s=parseStaffRecord(b,i);if(s)a.push(s)}return Object.freeze(a)}


const EDITABLE_DEPARTMENT_OFFSETS=Object.freeze({mess:O.MESS,medical:O.MED,rd:O.RD,intel:O.INTEL});
const EDITABLE_COMBAT_OFFSETS=Object.freeze({runSpeed:O.RUN,walkSpeed:O.WALK,fight:O.FIGHT,shoot:O.SHOOT,reload:O.RELOAD,throw:O.THROW,place:O.PLACE,defense:O.DEFENSE});

function intInRange(name,value,min,max){
 const n=Number(value);
 if(!Number.isInteger(n)||n<min||n>max)throw Error(`${name} must be an integer from ${min} to ${max}`);
 return n;
}
class PeaceWalkerSave{
 constructor(buf,name=''){
  this.originalFilename=name;
  this._originalEncrypted=new Uint8Array(buf);
  this._plain=decrypt(this._originalEncrypted);
  const c=crcReport(this._plain);
  this.validation=Object.freeze({
   sizeValid:this._originalEncrypted.length===FILE_SIZE,
   crcMainValid:c.main.valid,crcAuxValid:c.aux.valid,crcLargeValid:c.large.valid,crcSecondaryValid:c.secondary.valid,
   allCrcsValid:c.main.valid&&c.aux.valid&&c.large.valid&&c.secondary.valid,
   roundTripExact:equal(encrypt(this._plain),this._originalEncrypted)
  });
  // Reject invalid/decrypted data before any gameplay fields reach the UI.
  // Encryption round-tripping alone cannot distinguish a valid save from junk.
  const failed=Object.entries(c).filter(([,report])=>!report.valid);
  if(failed.length){
   const details=failed.map(([section,report])=>
    `${section}: stored 0x${hx(report.stored,8)}, calculated 0x${hx(report.calculated,8)}`
   ).join('; ');
   throw Error(`Save checksum validation failed (${details}). Expected an encrypted PC save; the file may be decrypted, corrupted or unsupported.`);
  }
  if(!this.validation.roundTripExact)throw Error('Save encryption round-trip validation failed');
  this._dirty=false;
  this._editedStaffIndices=new Set();
  this._refresh();
 }
 _refresh(){
  this.overview=parseOverview(this._plain);
  this.staff=parseStaff(this._plain);
  this.codenameTracker=global.PWSECodenameTracker?.parse(this._plain)||null;
 }
 get isDirty(){return this._dirty}
 get editedStaffIndices(){return Object.freeze(Array.from(this._editedStaffIndices).sort((a,b)=>a-b))}
 getStaffByName(name){const q=String(name).toUpperCase();return this.staff.filter(s=>s.name.toUpperCase()===q)}
 getStaffByIndex(index){return this.staff.find(s=>s.index===Number(index))||null}

 updateStaff(index,patch={}){
  index=intInRange('Staff index',index,0,STAFF_CAPACITY-1);
  const current=parseStaffRecord(this._plain,index);
  if(!current)throw Error(`Staff record ${index} is empty`);
  if(current.specialReadOnly)throw Error(`${current.name} is protected special staff and cannot be edited`);
  if(current.outerOps)throw Error('Staff currently dispatched on OUTER OPS cannot be edited');

  if(!patch || typeof patch !== 'object' || Array.isArray(patch))throw Error('Staff patch must be an object');
  const allowed=new Set(['gmpBase','morale','skills','departments','combatAbilities','lifeCurrent','psycheCurrent','tagCode','titleCode','clearStatuses','portraitCode','quoteKey','name']);
  for(const key of Object.keys(patch))if(!allowed.has(key))throw Error(`${key} is read-only or unsupported`);
  if(Object.keys(patch).length===0)return this.getStaffByIndex(index);
  for(const key of ['departments','combatAbilities']){
   if(Object.prototype.hasOwnProperty.call(patch,key) && (!patch[key] || typeof patch[key]!=='object' || Array.isArray(patch[key])))
    throw Error(`${key} must be an object`);
  }
  // Commit only after every field passes validation.
  const draft=new Uint8Array(this._plain);
  const base=STAFF_BASE+index*STAFF_STRIDE;

  if(Object.prototype.hasOwnProperty.call(patch,'name')){
   if(typeof patch.name!=='string')throw Error('Name must be text');
   // Preserve existing names byte-for-byte when untouched, including unmapped characters.
   if(patch.name!==current.name){
    if(!/^[A-Za-z0-9 -]+$/.test(patch.name))throw Error('Use English letters, numbers, spaces and hyphens for the name');
    const name=patch.name.trim().toUpperCase();
    if(name.length<1||name.length>15)throw Error('Name must contain 1–15 characters');
    if(name==='HIDEO')throw Error('HIDEO is reserved for protected special staff');
    if(name!==current.name){
     draft.fill(0,base+O.NAME,base+O.NAME+16);
     for(let i=0;i<name.length;i++)p8(draft,base+O.NAME+i,name.charCodeAt(i));
    }
   }
  }

  // Existing unmapped/special values may be preserved, but never assigned anew.
  if(Object.prototype.hasOwnProperty.call(patch,'tagCode')){
   const code=intInRange('Tag',patch.tagCode,0,255);
   if(code!==current.tag.code && ![6,7,8].includes(code))
    throw Error('Choose an ordinary tag: POW, VOL or NML');
   p8(draft,base+O.TAG,code);
  }
  if(Object.prototype.hasOwnProperty.call(patch,'titleCode')){
   const code=intInRange('Title',patch.titleCode,0,255);
   const names=global.PWSEStaffLookups?.TITLE_NAMES||TITLE_NAMES;
   const excluded=global.PWSEStaffLookups?.SPECIAL_ONLY_TITLE_IDS||[0x15,0x16,0x18,0x19,0x1A,0x1B,0x1C,0x57];
   if(code!==current.title.code && (!Object.prototype.hasOwnProperty.call(names,code)||excluded.includes(code)))
    throw Error('Choose a mapped ordinary staff title');
   p8(draft,base+O.TITLE,code);
  }

  if(Object.prototype.hasOwnProperty.call(patch,'quoteKey')){
   const seed=u32(draft,base+O.SPEECH);
   const count=current.genderFlag==='Male'?262:68;
   const prefix=current.genderFlag==='Male'?'m':'f';
   const currentKey=prefix+String(seed===0?0:seed%count+1).padStart(3,'0');
   const key=patch.quoteKey;
   if(typeof key!=='string')throw Error('Choose a quote from the list');
   if(key!==currentKey){
    if(!new RegExp('^'+prefix+'[0-9]{3}$').test(key) ||
       !Object.prototype.hasOwnProperty.call(global.PWSEQuotes?.ordinary||{},key))
     throw Error('Choose an ordinary quote matching this soldier’s gender');
    const index=Number(key.slice(1));
    if(index<1||index>count)throw Error('Quote is outside the supported English list');
    // Keep the seed's quotient where possible; zero is the blank-quote sentinel.
    let next=Math.floor(seed/count)*count+index-1;
    if(next===0)next=count;
    if(next>0xffffffff)next-=count;
    p32(draft,base+O.SPEECH,next);
   }
  }

  if(Object.prototype.hasOwnProperty.call(patch,'portraitCode')){
   const code=intInRange('Portrait',patch.portraitCode,0,0xffffffff);
   if(code!==current.portraitCode && !(global.VicbossPortraitOptions||[]).some(p=>p.code===code && p.gender===current.genderFlag))
    throw Error('Choose an observed ordinary portrait matching this soldier’s gender');
   // Write the complete observed resource value, leaving every other field intact.
   p32(draft,base+O.PORTRAIT,code);
  }

  // Explicit recovery action only. Ordinary edits never change status/location.
  if(Object.prototype.hasOwnProperty.call(patch,'clearStatuses')){
   if(typeof patch.clearStatuses!=='boolean')throw Error('clearStatuses must be a boolean');
   if(patch.clearStatuses && [O.SICK,O.WOUNDED,O.PTSD,O.HOSTILITY].some(offset=>u16(draft,base+offset)>0)){
    for(const offset of [O.SICK,O.WOUNDED,O.PTSD,O.HOSTILITY])p16(draft,base+offset,0);
    if(current.location.code!==1){
     p8(draft,base+O.LOCATION,1);
     p8(draft,base+O.PREV_LOCATION,current.location.code);
    }
    // Preserve status flags: tested recovery transfers do not require resetting them.
   }
  }

  if(Object.prototype.hasOwnProperty.call(patch,'gmpBase'))
   p32(draft,base+O.GMP,intInRange('GMP',patch.gmpBase,0,99999));

  // Editor limit 9999: user-tested effective cap. Signed interpretation above 32767 is suspected. Preserve original/ceiling fields.
  if(Object.prototype.hasOwnProperty.call(patch,'lifeCurrent'))
   p16(draft,base+O.LIFE_CURRENT,intInRange('LIFE',patch.lifeCurrent,0,9999));
  if(Object.prototype.hasOwnProperty.call(patch,'psycheCurrent'))
   p16(draft,base+O.PSY_CURRENT,intInRange('PSYCHE',patch.psycheCurrent,0,9999));

  if(Object.prototype.hasOwnProperty.call(patch,'morale'))
   p16(draft,base+O.MORALE,intInRange('Morale',patch.morale,0,999));

  if(Object.prototype.hasOwnProperty.call(patch,'skills')){
   if(!Array.isArray(patch.skills)||patch.skills.length!==4)throw Error('Skills must be an array of four skill IDs');
   const specialOnly=new Set(global.PWSEStaffLookups?.SPECIAL_ONLY_SKILL_IDS||[]);
   for(let i=0;i<4;i++){
    const code=intInRange(`Skill ${i+1} ID`,patch.skills[i],0,255);
    if(specialOnly.has(code)&&code!==current.skills[i].code)
     throw Error(`Skill 0x${code.toString(16).toUpperCase().padStart(2,'0')} is reserved for protected special staff`);
    p8(draft,base+O.SKILL1+i,code);
   }
  }

  if(patch.departments){
   for(const [key,value] of Object.entries(patch.departments)){
    if(!Object.prototype.hasOwnProperty.call(EDITABLE_DEPARTMENT_OFFSETS,key))throw Error(`Unknown department field: ${key}`);
    p16(draft,base+EDITABLE_DEPARTMENT_OFFSETS[key],intInRange(`${key} base value`,value,0,999));
   }
  }

  if(patch.combatAbilities){
   for(const [key,value] of Object.entries(patch.combatAbilities)){
    if(!Object.prototype.hasOwnProperty.call(EDITABLE_COMBAT_OFFSETS,key))throw Error(`Unknown combat ability: ${key}`);
    // 1250 is a deliberate PWSE practical editor limit, not the binary storage limit.
    p16(draft,base+EDITABLE_COMBAT_OFFSETS[key],intInRange(`${key} base value`,value,0,1250));
   }
  }

  if(equal(draft,this._plain))return this.getStaffByIndex(index);
  this._plain=draft;
  this._dirty=true;
  this._editedStaffIndices.add(index);
  this._refresh();
  return this.getStaffByIndex(index);
 }

 resetEdits(){
  this._plain=decrypt(this._originalEncrypted);
  this._dirty=false;
  this._editedStaffIndices.clear();
  this._refresh();
 }

 buildExport(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))throw Error('Export options must be an object');
  const p=new Uint8Array(this._plain);
  const updateLastSaved=options.updateLastSaved===true;
  const exportedLastSaved=updateLastSaved?writeSavedAt(p,options.now??new Date()):null;
  repairCrcs(p);
  const enc=encrypt(p);
  const check=crcReport(decrypt(enc));
  if(!Object.values(check).every(x=>x.valid))throw Error('Internal export CRC verification failed');
  const slot=u32(p,SLOT);
  return Object.freeze({
   bytes:enc,
   filename:outName(enc,slot,this.originalFilename),
   slot,
   edited:this._dirty||updateLastSaved,
   staffEdited:this._dirty,
   lastSavedUpdated:updateLastSaved,
   exportedLastSaved,
   editedStaffIndices:this.editedStaffIndices
  });
 }
}

const schema=Object.freeze({
 overview:Object.freeze({
  offsets:OVERVIEW_O,
  notes:Object.freeze({
   playTime:'CONFIRMED uint32 seconds at plaintext file 0x00C8.',
   savedAt:'CONFIRMED year/month/day/hour/minute fields at 0x017C..0x0181.',
   profileName:'CONFIRMED 16-byte profile-name field at 0x0188; text decoding is best-effort ASCII for now.',
   lastMission:'CONFIRMED internal last-mission definition ID at 0x5288/state+0x5244. Two matching mirrors are exposed for validation.',
   missionNumbering:'VERY STRONGLY SUPPORTED mapping: 33 Main Ops and 128 Extra Ops ordered by mission-definition +0x04.',
   totalGmp:'CONFIRMED uint32 at 0xB570.',
   totalCamaraderie:'CONFIRMED uint32 at 0x38874.'
  })
 }),
 codenameTracker:Object.freeze({
  notes:Object.freeze({
   counters:'VERY STRONGLY SUPPORTED save counterparts of the runtime v7 Kill/Incapacitation/Tranquilization/Stun counter banks.',
   grouping:'UI groups are summaries. The game selects a range family from the highest individual weapon type, not the largest grouped sum.',
   outcomeBranch:'VERY STRONGLY SUPPORTED evaluator rule: non-lethal when B+C+D-(2*A) is greater than zero.',
   storedRanks:'Codename ownership/new/rank bits are read-only from plaintext file 0x1C035..0x1C04C.',
   missionProgress:'Uses the 161 validated mission definition IDs and fixed 295 required mode-slot denominator from tracker v7.'
  })
 }),
 staff:Object.freeze({base:STAFF_BASE,stride:STAFF_STRIDE,capacity:STAFF_CAPACITY,locationNames:LOCATION_NAMES,tagNamesConfirmed:TAG_NAMES,titleNamesFallback:TITLE_NAMES,skillNamesFallback:SKILL_NAMES,notes:Object.freeze({nameEncoding:'Best-effort ASCII only; complete Peace Walker single-byte text mapping is not yet mapped.',tag05:'0x05 is a TRD candidate, not confirmed.',lifeCeiling:'+0x46/+0x4E are ceiling/potential candidates.',previousLocation:'+0x8C is very strongly supported as previous/source location.',medicalDerived:'Medical display formulas are experimentally very strongly supported.',moraleDerived:'Positive morale display multiplier is experimentally very strongly supported.',hostilityDisplay:'UI hostility is experimentally strongly supported as max(1, floor(raw/10)) for raw > 0.',descriptionSelector:'CONFIRMED ordinary quote seed: uint32 little-endian at +0x10. English base preview uses male modulo 262 / female modulo 68. Status/special overrides are not resolved. +0x14..+0x15 remain unknown and preserved. Experimental English quote editing changes only the uint32 seed.',phase1Editing:'Phase 1 edits persist directly in one mutable save model across multiple staff. Protected special staff are hidden from the normal sidebar; OUTER OPS staff remain blocked.',combatEditorLimit:'PWSE intentionally limits normal combat-ability editing to 1250 even though larger uint16 values can persist; 1250 is a practical UI limit, not a storage cap.',grades:'Stored/base ability values remain editable. Grade labels and derived display values use the VERY STRONGLY SUPPORTED morale formula; morale-derived values are never written back into the stored ability fields.'})})});

global.PWSE=Object.freeze({
 open:(buf,name='')=>new PeaceWalkerSave(buf,name),
 PeaceWalkerSave,
 schema,
 constants:Object.freeze({
  FILE_SIZE,
  HEROISM_FILE_OFFSET:HEROISM,
  SLOT_FILE_OFFSET:SLOT,
  OVERVIEW_OFFSETS:OVERVIEW_O,
  STAFF_BASE,STAFF_STRIDE,STAFF_CAPACITY
 })
});
})(window);
