// THIS SCRIPT WAS CREATED USING GENERATIVE AI
(function(global){
    'use strict';
    const $=id=>document.getElementById(id);
    let save=null,changesSinceExport=false;
    function el(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
    function act(action,id){
        if(!save)return;
        try{
            if(save.editZeke(action,id)){changesSinceExport=true;global.dispatchEvent(new Event('vicboss:zeke-changed'));}
            render();
            if(action==='add')$('zeke-add-'+id)?.focus({preventScroll:true});
        }catch(error){console.error('ZEKE edit failed',error);$('zeke-error').textContent=error.message;$('zeke-error').hidden=false;}
    }
    function ranges(numbers){
        const result=[];
        for(let i=0;i<numbers.length;i++){
            const start=numbers[i];let end=start;
            while(i+1<numbers.length&&numbers[i+1]===end+1)end=numbers[++i];
            result.push(start===end?String(start):`${start}–${end}`);
        }
        return result.join(', ');
    }
    function render(){
        const data=save?.zeke,host=$('zeke-parts'),boards=$('zeke-boards');if(!host||!boards)return;
        host.replaceChildren();boards.replaceChildren();$('zeke-error').hidden=true;
        $('zeke-recommended-rows')?.replaceChildren();
        const locked=!data||!data.valid||(data.assigned&&!save.outerOpsEditingEnabled);
        $('zeke-status').classList.toggle('zeke-editing-locked', Boolean(data?.assigned && !save?.outerOpsEditingEnabled));
        $('zeke-status').textContent=!data?'No save loaded':!data.valid?'Unrecognized part data — editing disabled.':data.assigned?(save.outerOpsEditingEnabled?'Assigned to OUTER OPS - editing enabled in Advanced':'Assigned to OUTER OPS - editing locked'):'Not assigned to OUTER OPS';
        $('zeke-count').textContent=data?String(data.count):'-';
        $('zeke-add-all').disabled=locked||data.count>=49;
        $('zeke-heal').disabled=locked||!data.entries.some(e=>e.life<100);
        $('zeke-unlock-boards').disabled=locked||data.boards.every(g=>g.obtained===100);
        if(!data)return;
        const sections=[['Main Parts',['walk','power','legs','pw-legs']],['Heads',['head','pupa','chrysalis','cocoon','pw-head']],['Optional Parts',['jet','radome','armor','railgun']]];
        for(const [name,ids] of sections){
            const section=el('section',undefined,'zeke-part-section');section.appendChild(el('h4',name));
            for(const id of ids){
                const group=data.groups.find(g=>g.id===id);
                const row=el('div',undefined,'zeke-part-row');row.appendChild(el('strong',group.name));
                const controls=el('div',undefined,'zeke-part-controls');controls.appendChild(el('span',`${group.entries.length} / ${group.limit}`));
                const button=el('button','Add Part');button.type='button';button.id='zeke-add-'+group.id;
                button.disabled=locked||group.entries.length>=group.limit||data.count>=49;
                button.setAttribute('aria-label','Add '+group.name);button.addEventListener('click',()=>act('add',group.id));controls.appendChild(button);row.appendChild(controls);
                const slots=el('div',undefined,'zeke-part-slots');
                for(let i=0;i<group.limit;i++){
                    const part=group.entries[i];const slot=el('span',part?`${part.life}%`:'-','zeke-part-slot'+(part?.equipped?' equipped':''));
                    slot.appendChild(el('small',part?.equipped?'Equipped':part?'Stored':'Empty'));
                    slots.appendChild(slot);
                }
                row.appendChild(slots);section.appendChild(row);
            }
            host.appendChild(section);
        }
        for(const [k,group] of data.boards.entries()){
            const section=el('section',undefined,'zeke-board-category');section.appendChild(el('h4',`${group.name}: ${group.obtained} / 100`));
            const grid=el('div',undefined,'zeke-board-grid');grid.setAttribute('aria-label',group.name+' boards');
            for(const board of group.entries){
                const status=board.obtained?'Obtained':'Missing';
                const label=`${group.name} ${String(board.number).padStart(3,'0')}: ${status}. Sources: ${board.sources.join(', ')||'See board guide'}.`;
                const cell=el('button',String(board.number).padStart(3,'0'),'zeke-board'+(board.obtained?' obtained':''));
                cell.type='button';cell.title=label;cell.setAttribute('aria-label',label);
                const show=()=>{$('zeke-board-detail').textContent=label;};cell.addEventListener('focus',show);cell.addEventListener('mouseenter',show);cell.addEventListener('click',show);
                grid.appendChild(cell);
            }
            section.dataset.boardType=String(k);section.appendChild(grid);boards.appendChild(section);
        }
        $('zeke-board-detail').textContent='Select or hover over a board to see its status and available boss fights.';
        const guide=$('zeke-recommended-rows');
        if(guide)for(const source of global.VicbossZeke.sources){
            const row=el('tr');row.appendChild(el('th',source.name));
            for(const group of data.boards){
                const needed=group.entries.filter(board=>!board.obtained&&board.sources[0]===source.name).map(board=>board.number);
                row.appendChild(el('td',ranges(needed)||'-'));
            }
            guide.appendChild(row);
        }
    }
    $('zeke-add-all')?.addEventListener('click',()=>act('add-all'));
    $('zeke-heal')?.addEventListener('click',()=>act('heal'));
    $('zeke-unlock-boards')?.addEventListener('click',()=>act('boards'));
    const guide=$('zeke-source-rows');
    if(guide)for(const source of global.VicbossZeke.sources){const row=el('tr');row.appendChild(el('th',source.name));for(const range of source.ranges)row.appendChild(el('td',range.join('–')));guide.appendChild(row);}
    function setSave(next){save=next||null;changesSinceExport=false;render();}
    function createCheckpoint(){const previous={save,changesSinceExport};return()=>{({save,changesSinceExport}=previous);};}
    global.VicbossZekeUI=Object.freeze({setSave,render,createCheckpoint,hasUnexportedChanges:()=>!!save&&changesSinceExport,markExported:()=>{changesSinceExport=false;}});
})(window);
