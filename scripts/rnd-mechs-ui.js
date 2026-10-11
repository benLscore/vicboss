// THIS SCRIPT WAS CREATED USING GENERATIVE AI

(function (global) {
    'use strict';
    let save = null, changesSinceExport = false, selectedModel = 'BTR-60PA';
    function el(tag, text) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function message(error) {
        const node = document.getElementById('rnd-mechs-error');
        if (node) { node.textContent = error ? error.message || String(error) : ''; node.hidden = !error; }
        if (error) console.error('Mech LIFE edit failed', error);
    }
    function commit(input, finalise = false) {
        if (!save || input.disabled) return;
        const slot = Number(input.dataset.mechLife);
        const before = save.rndMechs.entries.find(e => e.slot === slot);
        if (!before) return;
        if (input.value.trim() === '' || !Number.isFinite(input.valueAsNumber)) {
            if (finalise) input.value = String(before.lifePercent);
            return;
        }
        const percent = Math.max(1, Math.min(100, Math.trunc(input.valueAsNumber)));
        if (input.valueAsNumber !== percent) input.value = String(percent);
        try {
            save.updateMechLife(slot, percent);
            const after = save.rndMechs.entries.find(e => e.slot === slot);
            const bar = document.getElementById(`mech-life-bar-${slot}`);
            if (bar) bar.value = after.lifePercent;
            if (before.life !== after.life) {
                changesSinceExport = true;
                global.dispatchEvent(new Event('vicboss:mechs-changed'));
            }
            message(null);
        } catch (error) {
            input.value = String(before.lifePercent);
            const bar = document.getElementById(`mech-life-bar-${slot}`);
            if (bar) bar.value = before.lifePercent;
            message(error);
        }
    }
    function flushPendingEdits() {
        document.querySelectorAll('#rnd-mechs-categories input[data-mech-life]').forEach(input => commit(input, true));
    }
    function changeRoster(action) {
        try {
            flushPendingEdits(); action();
            changesSinceExport = true;
            global.dispatchEvent(new Event('vicboss:mechs-changed'));
            render();
        } catch (error) { message(error); }
    }
    function addGrid(host, title, entries) {
        const section = el('section');
        section.appendChild(el('h3', `${title} (${entries.length})`));
        if (!entries.length) {
            section.appendChild(el('p', 'None.'));
        } else {
            const scroll = el('div'); scroll.className = 'rnd-table-scroll'; scroll.tabIndex = 0;
            scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', title);
            const grid = el('div'); grid.className = 'rnd-mechs-grid';
            for (const entry of entries) {
                const card = el('div'); card.className = 'rnd-mech-card';
                card.appendChild(el('h4', entry.name));
                const editable = (!entry.assigned || save.outerOpsEditingEnabled) && entry.lifePercent !== null && entry.life > 0 && entry.category !== 'Unidentified Mechs';
                let lifeInput = null;
                if (editable) {
                    const label = el('label', 'LIFE: '), input = el('input');
                    lifeInput = input;
                    input.type = 'number'; input.min = '1'; input.max = '100'; input.step = '1';
                    input.value = String(entry.lifePercent); input.dataset.mechLife = String(entry.slot);
                    input.style.width = '4.5em'; input.disabled = !save.rndMechs.countMatches;
                    input.setAttribute('aria-label', `${entry.name} LIFE percentage`);
                    input.addEventListener('input', () => commit(input));
                    input.addEventListener('change', () => commit(input, true));
                    input.addEventListener('blur', () => commit(input, true));
                    label.appendChild(input); label.appendChild(document.createTextNode('%'));
                    card.appendChild(label);
                } else {
                    card.appendChild(el('p', `LIFE: ${entry.lifePercent === null ? 'Unknown' : entry.lifePercent + '%'}`));
                }
                if (entry.lifePercent !== null) {
                    const bar = el(editable ? 'input' : 'progress');
                    if (editable) {
                        bar.type = 'range'; bar.min = '1'; bar.step = '1';
                        bar.disabled = lifeInput.disabled;
                        bar.style.display = 'block'; bar.style.width = '100%';
                        bar.style.height = '1rem'; bar.style.margin = '0';
                        const changeLife = () => {
                            lifeInput.value = bar.value;
                            commit(lifeInput, true);
                        };
                        bar.addEventListener('input', changeLife);
                        bar.addEventListener('change', changeLife);
                    }
                    bar.max = 100; bar.value = entry.lifePercent; bar.id = `mech-life-bar-${entry.slot}`;
                    bar.setAttribute('aria-label', `${entry.name} LIFE`);
                    card.appendChild(bar);
                }
                if (!entry.assigned) {
                    const remove = el('button', 'Remove'); remove.type = 'button';
                    remove.disabled = !save.rndMechs.countMatches;
                    remove.setAttribute('aria-label', `Remove ${entry.name}`);
                    remove.addEventListener('click', () => changeRoster(() => save.removeMech(entry.slot)));
                    card.appendChild(remove);
                }
                grid.appendChild(card);
            }
            scroll.appendChild(grid); section.appendChild(scroll);
        }
        host.appendChild(section);
    }
    function render() {
        const host = document.getElementById('rnd-mechs-categories');
        if (!host) return;
        const outer = document.getElementById('rnd');
        const top = outer?.scrollTop || 0;
        const assignedOpen = host.querySelector('details')?.open || false;
        const scrolls = Array.from(host.querySelectorAll('.rnd-table-scroll'), node => node.scrollLeft);
        host.replaceChildren();
        const error = el('p'); error.id = 'rnd-mechs-error'; error.hidden = true;
        error.className = 'rnd-edit-error'; error.setAttribute('role', 'alert'); host.appendChild(error);
        const data = save?.rndMechs;
        if (!data) { host.appendChild(el('p', 'Load a save to view captured mechs.')); return; }
        const actions = el('p'), heal = el('button', 'Heal All Mechs');
        heal.type = 'button'; heal.id = 'rnd-mechs-heal-all';
        heal.disabled = !data.countMatches || !data.entries.some(entry => !entry.assigned || save.outerOpsEditingEnabled);
        heal.addEventListener('click', () => {
            try {
                flushPendingEdits();
                if (save.healAllMechs()) {
                    changesSinceExport = true;
                    global.dispatchEvent(new Event('vicboss:mechs-changed'));
                }
                render();
            } catch (error) { message(error); }
        });
        actions.appendChild(heal);
        const controls = el('div'), label = el('label', 'Add Mech: '), select = el('select');
        select.id = 'rnd-mech-model';
        for (const model of global.VicbossRnDMechs.models) {
            const option = el('option', model); option.value = model; select.appendChild(option);
        }
        select.value = selectedModel;
        select.addEventListener('change', () => { selectedModel = select.value; });
        label.appendChild(select); controls.appendChild(label);
        const add = el('button', 'Add Mech'); add.type = 'button';
        add.className = "add-mech-button";
        add.disabled = !data.countMatches || data.entries.length >= data.capacity;
        add.addEventListener('click', () => changeRoster(() => save.addMech(select.value)));
        controls.appendChild(add); host.appendChild(controls);
        if (data.entries.length >= data.capacity) host.appendChild(el('p', '50-mech limit reached.'));
        const storage = data.entries.filter(e => !e.assigned);
        const assigned = data.entries.filter(e => e.assigned);
        host.appendChild(el('p', `${data.entries.length} / ${data.capacity} mechs - ${storage.length} in storage, ${assigned.length} assigned to OUTER OPS.`));
        host.appendChild(actions);
        if (!data.countMatches) {
            host.appendChild(el('p', 'The saved mech count does not match the occupied records. This roster needs verification.'));
            console.warn('Captured mech count mismatch', data);
        }
        for (const category of ['Armored Vehicles', 'Tanks', 'Helicopters', 'Unidentified Mechs']) {
            const entries = storage.filter(e => e.category === category);
            if (category !== 'Unidentified Mechs' || entries.length) addGrid(host, category, entries);
        }
        if (assigned.length) {
            const details = el('details'); details.open = assignedOpen;
            details.appendChild(el('summary', `Assigned to OUTER OPS (${assigned.length})`));
            addGrid(details, 'Assigned Mechs', assigned); host.appendChild(details);
        }
        host.querySelectorAll('.rnd-table-scroll').forEach((node, i) => { node.scrollLeft = scrolls[i] || 0; });
        if (outer) outer.scrollTop = top;
    }
    function setSave(next) { save = next || null; changesSinceExport = false; selectedModel = 'BTR-60PA'; render(); }
    function createCheckpoint() {
        const previous = {save, changesSinceExport, selectedModel};
        return () => { ({save, changesSinceExport, selectedModel} = previous); };
    }
    global.VicbossRnDMechsUI = Object.freeze({setSave, render, createCheckpoint, flushPendingEdits,
        hasUnexportedChanges: () => Boolean(save && changesSinceExport),
        markExported: () => { changesSinceExport = false; }
    });
})(window);
