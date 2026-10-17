// THIS SCRIPT WAS CREATED USING GENERATIVE AI
(function(global){
    'use strict';
    // PC plaintext offsets, verified with controlled inventory, equipment,
    // damage, NEW-board and collection tests. Capacity includes equipped parts.
    const COUNT=0x1385c, PARTS=0x139f0, STRIDE=12, BOARDS=0x9d48, VIEWED=0x13860;
    const definitions=[
        ['walk','ZEKE Walk Unit',4,1,3],['power','ZEKE Power Unit',3,1,3],
        ['legs','ZEKE Leg Parts',2,1,3],['pw-legs','Peace Walker Leg Parts',2,2,3],
        ['head','ZEKE Head',1,1,5],['pupa','Pupa Head',1,2,5],
        ['chrysalis','Chrysalis Head',1,3,5],['cocoon','Cocoon Head',1,4,5],['pw-head','Peace Walker Head',1,5,5],
        ['jet','Jet Pack',5,1,3],['radome','Radome',5,2,3],['armor','Armor',5,3,3],['railgun','Railgun',5,4,3]
    ].map(([id,name,type,variant,limit])=>Object.freeze({id,name,type,variant,limit}));
    const boardTypes=['Mobility','Sense','Attack','Control'];
    // Community board-range guide supplied by the user. Ranges refer to
    // global 1–100 positions in each category, not the boss-local name suffix.
    const sources=[
        ['Pupa',[[1,30],[1,15],[1,6],[1,10]]],
        ['Chrysalis',[[51,65],[26,55],[9,18],[18,23]]],
        ['Cocoon',[[76,81],[76,85],[26,55],[26,40]]],
        ['Pupa Type II',[[11,40],[6,20],[2,7],[5,14]]],
        ['Chrysalis Type II',[[56,70],[37,65],[14,22],[20,24]]],
        ['Cocoon Type II',[[77,82],[80,89],[38,65],[31,45]]],
        ['Peace Walker Type II',[[84,94],[93,97],[76,89],[51,90]]],
        ['Pupa Custom',[[21,50],[11,25],[3,8],[9,17]]],
        ['Chrysalis Custom',[[61,75],[46,75],[17,25],[20,25]]],
        ['Cocoon Custom',[[78,83],[83,92],[51,75],[36,50]]],
        ['Peace Walker Custom',[[90,100],[96,100],[87,100],[61,100]]]
    ].map(([name,ranges])=>Object.freeze({name,ranges:Object.freeze(ranges.map(r=>Object.freeze(r)))}));
    function parse(bytes){
        const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
        const count=view.getUint32(COUNT,true),entries=[];
        let valid=count<=49;
        for(let slot=0;slot<Math.min(count,49);slot++){
            const p=PARTS+slot*STRIDE,type=bytes[p+8],variant=bytes[p+9];
            const def=definitions.find(d=>d.type===type&&d.variant===variant);
            const life=view.getUint16(p+10,true),flags=view.getUint16(p+6,true);
            if(!def||life<1||life>100)valid=false;
            entries.push(Object.freeze({slot,id:def?.id||null,name:def?.name||'Unknown part',life,equipped:!!(flags&1),isNew:!!(flags&4)}));
        }
        for(const def of definitions)if(entries.filter(e=>e.id===def.id).length>def.limit)valid=false;
        const groups=definitions.map(def=>Object.freeze({...def,entries:Object.freeze(entries.filter(e=>e.id===def.id))}));
        const boards=boardTypes.map((name,k)=>{
            const entries=Array.from({length:100},(_,i)=>{
                const number=i+1,obtained=bytes[BOARDS+k*100+i]>0;
                return Object.freeze({number,obtained,isNew:obtained&&!bytes[VIEWED+k*100+i],
                    sources:Object.freeze(sources.filter(s=>number>=s.ranges[k][0]&&number<=s.ranges[k][1]).map(s=>s.name))});
            });
            return Object.freeze({name,entries:Object.freeze(entries),obtained:entries.filter(e=>e.obtained).length});
        });
        // Assignment toggles bit 0x10 here and creates the ZEKE OUTER OPS
        // record at 0x15e10. Also lock if that record remains populated.
        const assigned=!!(bytes[0xb566]&0x10)||bytes.subarray(0x15e10,0x15e30).some(x=>x!==0);
        return Object.freeze({count,valid,assigned,entries:Object.freeze(entries),groups:Object.freeze(groups),boards:Object.freeze(boards)});
    }
    function edit(bytes,action,id,allowOuterOps=false){
        const data=parse(bytes);
        if(data.assigned&&!allowOuterOps)throw Error('Enable OUTER OPS editing in Advanced to edit ZEKE while assigned.');
        if(!data.valid)throw Error('ZEKE part data could not be safely interpreted.');
        const draft=new Uint8Array(bytes),view=new DataView(draft.buffer);let changed=false;
        if(action==='add'){
            const group=data.groups.find(g=>g.id===id);
            if(!group)throw Error('Unknown ZEKE part.');
            if(data.count>=49||group.entries.length>=group.limit)throw Error('The storage limit for this part has been reached.');
            const p=PARTS+data.count*STRIDE;
            draft.fill(0,p,p+STRIDE);view.setUint16(p+6,4,true);
            draft[p+8]=group.type;draft[p+9]=group.variant;view.setUint16(p+10,100,true);
            view.setUint32(COUNT,data.count+1,true);changed=true;
        }else if(action==='add-all'){
            let count=data.count;
            for(const group of data.groups){
                for(let i=group.entries.length;i<group.limit;i++){
                    const p=PARTS+count*STRIDE;
                    draft.fill(0,p,p+STRIDE);view.setUint16(p+6,4,true);
                    draft[p+8]=group.type;draft[p+9]=group.variant;
                    view.setUint16(p+10,100,true);count++;changed=true;
                }
            }
            if(changed)view.setUint32(COUNT,count,true);
        }else if(action==='heal'){
            for(const e of data.entries)if(e.life!==100){view.setUint16(PARTS+e.slot*STRIDE+10,100,true);changed=true;}
        }else if(action==='boards'){
            for(let i=0;i<400;i++)if(!draft[BOARDS+i]){
                draft[BOARDS+i]=1;draft[VIEWED+i]=0;changed=true;
            }
        }else throw Error('Unknown ZEKE action.');
        return changed?draft:null;
    }
    global.VicbossZeke=Object.freeze({parse,edit,definitions:Object.freeze(definitions),sources:Object.freeze(sources)});
})(window);
