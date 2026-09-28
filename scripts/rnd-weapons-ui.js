// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Weapon tables with guarded stock editing. */
(function (global) {
    'use strict';
    let save = null;
    let changesSinceExport = false;
    function message(text, error = false) {
        let el = $('rnd-weapon-edit-message');
        if (!el) {
            el = element('p'); el.id = 'rnd-weapon-edit-message';
            el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
            $('rnd-weapon-categories')?.before(el);
        }
        if (text && !error) console.debug('[Vicboss weapons]', text);
        el.textContent = error ? text : '';
        el.hidden = !error || !text;
        el.classList.toggle('rnd-edit-error', error);
    }
    function changeDevelopment(entry, developed, complete = false) {
        try {
            const plan = save.planWeaponDevelopment(entry.id, developed);
            const prerequisites = plan.filter(e => e.id !== entry.id);

            save.updateWeapon(entry.id, complete ? {completeDevelopment: true} : {developed});
            changesSinceExport = true;
            global.dispatchEvent(new Event('vicboss:weapons-changed'));
            render();
            message(`${entry.name}, rank ${entry.rank}: ${developed ? 'developed' : 'set to not developed'}.${prerequisites.length ? ` Also developed ${prerequisites.length} prerequisite(s).` : ''}`);
        } catch (error) {
            console.error('Weapon development edit failed', error);
            render(); message(error.message || String(error), true);
        }
    }
    function commitStock(input, finalise = false) {
        const entry = save?.rndWeapons?.flatMap(g => g.entries).find(e => e.id === Number(input.dataset.weaponId));
        if (!entry || input.disabled) return;
        if (input.value === '' || !Number.isFinite(input.valueAsNumber)) {
            if (finalise) input.value = String(entry.stock);
            return;
        }
        const stock = Math.max(0, Math.min(global.VicbossRnDWeapons.maxStock, Math.trunc(input.valueAsNumber)));
        if (stock !== input.valueAsNumber) input.value = String(stock);
        if (stock === entry.stock) return;
        try {
            save.updateWeapon(entry.id, {stock});
            changesSinceExport = true;
            global.dispatchEvent(new Event('vicboss:weapons-changed'));
            message(`${entry.name}, rank ${entry.rank}: stock set to ${stock}.`);
        } catch (error) {
            console.error('Weapon stock edit failed', error);
            input.value = String(entry.stock); message(error.message || String(error), true);
        }
    }
    function flushPendingEdits() {
        document.querySelectorAll('#rnd-weapon-categories input[data-control="stock"]').forEach(input => commitStock(input, true));
        return true;
    }
    const $ = id => document.getElementById(id);
    function element(tag, text, className) {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        if (className) el.className = className;
        return el;
    }
    function weaponCard(entry) {
        const card = element('div', undefined, 'rnd-weapon-card');
        card.dataset.weaponId = String(entry.id);
        card.appendChild(element('strong', entry.name));
        if (!entry.available) { card.appendChild(element('p', 'Data unavailable')); return card; }
        card.dataset.state = String(entry.state);
        card.appendChild(element('p', ({1: 'Not developed', 2: 'Developing', 3: 'Developed'})[entry.state] || 'Unknown status', 'rnd-item-state'));
        const developmentLabel = element('label', undefined, 'rnd-developed-label');
        const checkbox = element('input'); checkbox.type = 'checkbox'; checkbox.checked = entry.state === 3;
        checkbox.dataset.control = 'developed'; checkbox.disabled = entry.startingEquipment || ![1, 2, 3].includes(entry.state);
        checkbox.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, developed`);
        if (!checkbox.disabled && entry.state === 3) {
            try { save.planWeaponDevelopment(entry.id, false); }
            catch (error) { checkbox.disabled = true; checkbox.title = error.message; }
        }
        checkbox.addEventListener('change', () => changeDevelopment(entry, checkbox.checked));
        developmentLabel.append(checkbox, document.createTextNode(' Developed')); card.appendChild(developmentLabel);
        if (entry.state === 2 && !entry.startingEquipment) {
            const button = element('button', 'Complete development'); button.type = 'button'; button.dataset.control = 'complete';
            button.addEventListener('click', () => changeDevelopment(entry, true, true)); card.appendChild(button);
        }
        if (entry.state === 2) {
            const valid = entry.progress <= 100;
            card.appendChild(element('p', valid ? `Progress: ${entry.progress}%` : 'Progress unavailable'));
            if (valid) {
                const progress = element('progress'); progress.max = 100; progress.value = entry.progress;
                progress.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, development progress`);
                card.appendChild(progress);
            }
        }
        if (entry.state === 3) {
            if (entry.usageLevel !== null) {
                const label = element('label', 'Usage Level: ');
                const select = element('select'); select.dataset.control = 'usageLevel';
                select.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, Usage Level`);
                select.title = 'Changes Usage Level while preserving accumulated EXP.';
                for (const level of [1, 2, 3]) {
                    const option = element('option', String(level)); option.value = String(level); select.appendChild(option);
                }
                select.value = String(entry.usageLevel);
                select.addEventListener('change', () => {
                    const current = save?.rndWeapons?.flatMap(g => g.entries).find(e => e.id === entry.id);
                    if (!current || Number(select.value) === current.usageLevel) return;
                    try {
                        save.updateWeapon(entry.id, {usageLevel: Number(select.value)});
                        changesSinceExport = true;
                        global.dispatchEvent(new Event('vicboss:weapons-changed'));
                        message(`${entry.name}, rank ${entry.rank}: Usage Level set to ${select.value}.`);
                    } catch (error) {
                        console.error('Weapon Usage Level edit failed', error);
                        select.value = String(current.usageLevel); message(error.message || String(error), true);
                    }
                });
                label.appendChild(select); card.appendChild(label);
            } else {
                card.appendChild(element('p', `Usage Level: ${entry.usageLevel ?? '—'}`));
            }
        }
        if (entry.showStock && entry.state === 3) {
            const label = element('label', 'Stock: ', 'rnd-stock-label');
            const input = element('input'); input.type = 'number'; input.min = '0';
            input.max = String(global.VicbossRnDWeapons.maxStock); input.step = '1'; input.value = String(entry.stock);
            input.dataset.control = 'stock'; input.dataset.weaponId = String(entry.id);
            input.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, stock`);
            input.addEventListener('input', () => commitStock(input));
            input.addEventListener('change', () => commitStock(input, true));
            input.addEventListener('blur', () => commitStock(input, true));
            label.appendChild(input); card.appendChild(label);
        } else if (entry.showStock) card.appendChild(element('p', entry.state === 3 ? `Stock: ${entry.stock.toLocaleString('en-US')}` : 'Stock: —'));
        return card;
    }
    function render() {
        const container = $('rnd-weapon-categories');
        if (!container) return;
        const top = $('rnd')?.scrollTop || 0;
        const scrolls = new Map([...container.querySelectorAll('.rnd-weapon-category')].map(el => [el.dataset.category, el.querySelector('.rnd-table-scroll')?.scrollLeft || 0]));
        const active = document.activeElement;
        const focusId = active?.closest('.rnd-weapon-card')?.dataset.weaponId, control = active?.dataset.control;
        container.replaceChildren();
        const groups = save?.rndWeapons;
        if (!groups) { $('rnd-weapons-summary').textContent = 'No save loaded'; return; }
        const entries = groups.flatMap(g => g.entries);
        const developed = entries.filter(e => e.available && e.state === 3).length;
        const unreadable = entries.filter(e => !e.available).length;
        $('rnd-weapons-summary').textContent = `${developed} of ${entries.length} weapons developed ${unreadable ? ' Some weapon data could not be read.' : ''}`;
        const selected = $('rnd-weapon-category')?.value || 'all';
        for (const category of global.VicbossRnDWeapons.categories) {
            if (selected !== 'all' && selected !== category) continue;
            const categoryGroups = groups.filter(g => g.category === category);
            const categoryEntries = categoryGroups.flatMap(g => g.entries);
            const count = categoryEntries.filter(e => e.available && e.state === 3).length;
            const completeData = categoryEntries.every(e => e.available);
            const section = element('section', undefined, 'rnd-weapon-category');
            section.dataset.category = category;
            section.appendChild(element('h3', category));
            const percent = Number((count * 100 / categoryEntries.length).toFixed(1));
            section.appendChild(element('p', completeData ? `${count} of ${categoryEntries.length} developed (${percent}%).` : 'Completion unavailable: some records could not be read.', 'rnd-weapon-category-summary'));
            const scroll = element('div', undefined, 'rnd-table-scroll');
            scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', category);
            const table = element('table', undefined, 'rnd-rank-table');
            table.appendChild(element('caption', `${category} by rank`));
            const head = element('thead'), header = element('tr');
            for (const name of ['Weapon', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5']) {
                const th = element('th', name); th.scope = 'col'; header.appendChild(th);
            }
            head.appendChild(header); table.appendChild(head);
            const body = element('tbody');
            for (const group of categoryGroups) {
                const row = element('tr'), label = element('th', group.name); label.scope = 'row'; row.appendChild(label);
                for (let rank = 1; rank <= 5; rank++) {
                    const cell = element('td'), entry = group.entries.find(e => e.rank === rank);
                    if (entry) cell.appendChild(weaponCard(entry));
                    else { cell.textContent = '—'; cell.setAttribute('aria-label', 'No variant at this rank'); }
                    row.appendChild(cell);
                }
                body.appendChild(row);
            }
            table.appendChild(body); scroll.appendChild(table); section.appendChild(scroll); container.appendChild(section);
        }
        if (focusId && control) {
            const card = container.querySelector(`[data-weapon-id="${focusId}"]`);
            const target = card?.querySelector(`[data-control="${control}"]`);
            if (target && !target.disabled) target.focus({preventScroll: true});
        }
        container.querySelectorAll('.rnd-weapon-category').forEach(el => { el.querySelector('.rnd-table-scroll').scrollLeft = scrolls.get(el.dataset.category) || 0; });
        if ($('rnd')) $('rnd').scrollTop = top;
    }
    document.querySelectorAll('[data-rnd-bulk="weapons"]').forEach(button => {
        button.addEventListener('click', () => {
            if (!save) return;
            const action = button.dataset.action;

            try {
                flushPendingEdits();
                const changed = save.bulkRnD('weapons', action);
                if (changed) {
                    changesSinceExport = true;
                    global.dispatchEvent(new Event('vicboss:weapons-changed'));
                }
                render(); message(changed ? `Updated ${changed} weapons variants.` : 'No changes needed.');
            } catch (error) {
                console.error('Bulk R&D edit failed', error); message(error.message || String(error), true);
            }
        });
    });
    function setSave(newSave) {
        document.querySelectorAll('[data-rnd-bulk="weapons"]').forEach(button => { button.disabled = !newSave; });
        save = newSave; changesSinceExport = false; message('');
        const select = $('rnd-weapon-category');
        if (select) {
            select.replaceChildren();
            const all = element('option', 'All categories'); all.value = 'all'; select.appendChild(all);
            for (const category of global.VicbossRnDWeapons.categories) {
                const option = element('option', category); option.value = category; select.appendChild(option);
            }
            select.value = 'all';
        }
        render();
    }
    $('rnd-weapon-category')?.addEventListener('change', render);
    global.VicbossRnDWeaponsUI = Object.freeze({setSave, render, flushPendingEdits,
        hasUnexportedChanges: () => Boolean(save && changesSinceExport),
        markExported: () => { changesSinceExport = false; }
    });
})(window);
