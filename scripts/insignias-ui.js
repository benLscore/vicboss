// THIS SCRIPT WAS CREATED USING GENERATIVE AI

(function(global){
    'use strict';
    const $=id=>document.getElementById(id);
    let save=null,changesSinceExport=false;
    function element(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
    function count(){const button=$('award-all-insignias');if(button)button.disabled=!save?.insignias||save.insignias.every(e=>e.obtained);if($('insignia-count'))$('insignia-count').textContent=save?.insignias?String(save.insignias.filter(e=>e.obtained).length):'—';}
    function message(error){const el=$('insignia-error');if(el){el.textContent=error?'Could not update this insignia.':'';el.hidden=!error;}if(error)console.error('Insignia update failed',error);}
    function render(){
        const host=$('insignia-rows');if(!host)return;
        host.replaceChildren();message(null);count();
        for(const entry of save?.insignias||[]){
            const row=element('tr'),owned=element('td'),checkbox=element('input');
            checkbox.type='checkbox';checkbox.id='insignia-owned-'+entry.id;checkbox.checked=entry.obtained;
            checkbox.setAttribute('aria-label',entry.name+': Obtained');
            checkbox.addEventListener('change',()=>{
                if(!save)return;
                try{
                    if(save.updateInsignia(entry.id,checkbox.checked)){
                        changesSinceExport=true;
                        global.dispatchEvent(new Event('vicboss:insignias-changed'));
                    }
                    message(null);count();
                }catch(error){checkbox.checked=!!save.insignias.find(e=>e.id===entry.id)?.obtained;message(error);}
            });
            owned.className='insignia-obtained-cell';
            owned.addEventListener('click',event=>{
                if(event.target===checkbox)return;
                checkbox.click();
                checkbox.focus({preventScroll:true});
            });
            owned.appendChild(checkbox);row.appendChild(owned);
            const name=element('th');name.setAttribute('scope','row');
            const label=element('label',entry.name);label.htmlFor=checkbox.id;name.appendChild(label);row.appendChild(name);
            row.appendChild(element('td',entry.description));row.appendChild(element('td',entry.note||'-'));host.appendChild(row);
        }
    }
    $('award-all-insignias')?.addEventListener('click',()=>{
        if(!save)return;
        try{
            if(save.awardAllInsignias()){
                changesSinceExport=true;
                global.dispatchEvent(new Event('vicboss:insignias-changed'));
            }
            render();
        }catch(error){message(error);}
    });
    function setSave(next){save=next||null;changesSinceExport=false;render();}
    function createCheckpoint(){const previous={save,changesSinceExport};return ()=>{({save,changesSinceExport}=previous);};}
    global.VicbossInsigniasUI=Object.freeze({setSave,render,createCheckpoint,
        hasUnexportedChanges:()=>Boolean(save&&changesSinceExport),
        markExported:()=>{changesSinceExport=false;}
    });
})(window);
