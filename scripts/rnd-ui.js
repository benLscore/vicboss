// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* R&D Items UI. Changes go through the core's guarded item editor. */
(function (global) {
    'use strict';
    const $ = id => document.getElementById(id);
    let save = null;
    let changesSinceExport = false;
    function message(text, error = false) {
        let el = $('rnd-edit-message');
        if (!el) {
            el = element('p'); el.id = 'rnd-edit-message';
            el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
            $('rnd-item-categories')?.before(el);
        }
        if (text && !error) console.debug('[Vicboss items]', text);
        el.textContent = error ? text : '';
        el.hidden = !error || !text;
        el.classList.toggle('rnd-edit-error', error);
    }
    function currentEntry(id) { return save?.rndItems?.flatMap(g => g.entries).find(e => e.id === id); }
    function applyEdit(id, patch, redraw = true) {
        try {
            if (!save) return false;
            save.updateItem(id, patch);
            changesSinceExport = true;
            global.dispatchEvent(new Event('vicboss:items-changed'));
            if (redraw) render();
            return true;
        } catch (error) {
            console.error('R&D item edit failed', error);
            if (redraw) render();
            message(error.message || String(error), true);
            return false;
        }
    }
    function changeDevelopment(entry, developed, complete = false) {
        try {
            const plan = save.planItemDevelopment(entry.id, developed);
            const earlier = plan.filter(e => e.id !== entry.id);

            if (applyEdit(entry.id, complete ? {completeDevelopment: true} : {developed})) {
                const state = entry.obtainedOnly ? (developed ? 'obtained' : 'set to not obtained') : (developed ? 'developed' : 'set to not developed');
                message(`${entry.name}, rank ${entry.rank}: ${state}.${earlier.length ? ` Also developed ${earlier.map(e => `rank ${e.rank}`).join(', ')}.` : ''}`);
            }
        } catch (error) {
            console.error('R&D development edit failed', error);
            render(); message(error.message || String(error), true);
        }
    }
    function commitStock(input, finalise = false) {
        const entry = currentEntry(Number(input.dataset.itemId));
        if (!entry || input.disabled) return;
        if (input.value === '' || !Number.isFinite(input.valueAsNumber)) {
            if (finalise) input.value = String(entry.stock);
            return;
        }
        const value = Math.max(0, Math.min(global.VicbossRnDItems.maxStock, Math.trunc(input.valueAsNumber)));
        if (value !== input.valueAsNumber) input.value = String(value);
        if (value === entry.stock) return;
        if (applyEdit(entry.id, {stock: value}, false)) message(`${entry.name}, rank ${entry.rank}: stock set to ${value}.`);
        else input.value = String(entry.stock);
    }
    function flushPendingEdits() {
        document.querySelectorAll('#rnd-item-categories input[data-control="stock"]').forEach(input => commitStock(input, true));
        return true;
    }
    function element(tag, text, className) {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        if (className) el.className = className;
        return el;
    }
    function selectTab(name) {
        document.querySelectorAll('[data-rnd-tab]').forEach(button => {
            const active = button.dataset.rndTab === name;
            button.setAttribute('aria-selected', String(active));
            button.tabIndex = active ? 0 : -1;
        });
        document.querySelectorAll('[data-rnd-panel]').forEach(panel => {
            panel.hidden = panel.dataset.rndPanel !== name;
        });
    }
    const buttons = Array.from(document.querySelectorAll('[data-rnd-tab]'));
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => selectTab(button.dataset.rndTab));
        button.addEventListener('keydown', event => {
            const directions = {ArrowRight: (index + 1) % buttons.length, ArrowLeft: (index + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1};
            if (!(event.key in directions)) return;
            event.preventDefault();
            const target = buttons[directions[event.key]];
            selectTab(target.dataset.rndTab); target.focus();
        });
    });
    function card(entry) {
        const el = element('div', undefined, 'rnd-item-card');
        el.dataset.itemId = String(entry.id);
        el.appendChild(element('strong', entry.name));
        if (!entry.available) {
            el.appendChild(element('p', 'Data unavailable'));
            return el;
        }
        const status = (entry.obtainedOnly ? {1: 'Not obtained', 3: 'Obtained'} : {1: 'Not developed', 2: 'Developing', 3: 'Developed'})[entry.state] || 'Unknown status';
        el.dataset.state = String(entry.state);
        el.appendChild(element('p', status, 'rnd-item-state'));
        const label = element('label', undefined, 'rnd-developed-label');
        const checkbox = element('input'); checkbox.type = 'checkbox'; checkbox.checked = entry.state === 3;
        checkbox.dataset.control = 'developed';
        checkbox.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, ${entry.obtainedOnly ? 'obtained' : 'developed'}`);
        checkbox.disabled = entry.readOnly || !(entry.obtainedOnly ? [1, 3] : [1, 2, 3]).includes(entry.state);
        if (!checkbox.disabled && entry.state === 3) {
            try { save.planItemDevelopment(entry.id, false); }
            catch { checkbox.disabled = true; }
        }
        checkbox.addEventListener('change', () => changeDevelopment(entry, checkbox.checked));
        label.append(checkbox, document.createTextNode(entry.obtainedOnly ? ' Obtained' : ' Developed')); el.appendChild(label);
        if (!entry.obtainedOnly && entry.state === 2) {
            const progressValid = entry.progress <= 100;
            el.appendChild(element('p', progressValid ? `Progress: ${entry.progress}%` : 'Progress unavailable'));
            if (progressValid) {
                const progress = element('progress');
                progress.max = 100; progress.value = entry.progress;
                progress.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, development progress`);
                el.appendChild(progress);
            }
        }
        if (entry.state === 2 && !entry.readOnly && !entry.obtainedOnly) {
            const complete = element('button', 'Complete development');
            complete.type = 'button'; complete.dataset.control = 'complete';
            complete.addEventListener('click', () => changeDevelopment(entry, true, true));
            el.appendChild(complete);
        }
        if (entry.state === 3 && !entry.fixedStock) {
            const stock = element('label', 'Stock: ', 'rnd-stock-label');
            const input = element('input'); input.type = 'number'; input.min = '0';
            input.max = String(global.VicbossRnDItems.maxStock); input.step = '1'; input.value = String(entry.stock);
            input.dataset.control = 'stock'; input.dataset.itemId = String(entry.id);
            input.setAttribute('aria-label', `${entry.name}, rank ${entry.rank}, stock`);
            input.addEventListener('input', () => commitStock(input));
            input.addEventListener('change', () => commitStock(input, true));
            input.addEventListener('blur', () => commitStock(input, true));
            stock.appendChild(input); el.appendChild(stock);
        } else {
            el.appendChild(element('p', entry.state === 3 ? `Stock: ${entry.stock.toLocaleString('en-US')}` : 'Stock: —'));
        }
        return el;
    }
    function render() {
        const container = $('rnd-item-categories');
        if (!container) return;
        const panelTop = $('rnd')?.scrollTop || 0;
        const scrolls = Array.from(container.querySelectorAll('.rnd-table-scroll'), el => el.scrollLeft);
        const active = document.activeElement;
        const focusId = active?.closest('.rnd-item-card')?.dataset.itemId;
        const focusControl = active?.dataset.control;
        container.replaceChildren();
        const groups = save?.rndItems;
        if (!groups) { $('rnd-items-summary').textContent = 'No save loaded'; return; }
        const entries = groups.flatMap(group => group.entries);
        const developed = entries.filter(entry => entry.available && entry.state === 3 && !entry.obtainedOnly).length;
        const obtained = entries.filter(entry => entry.available && entry.state === 3 && entry.obtainedOnly).length;
        const unavailable = entries.filter(entry => !entry.available).length;
        $('rnd-items-summary').textContent = `${developed + obtained} of ${entries.length} items developed`;
        if (unavailable) {
            $('rnd-items-summary').textContent += ' Some item data could not be read.';
            console.warn('R&D item record IDs/lengths did not match the catalogue', {unavailable});
        }
        for (const category of global.VicbossRnDItems.categories) {
            const section = element('section', undefined, 'rnd-item-category');
            section.appendChild(element('h3', category));
            const scroll = element('div', undefined, 'rnd-table-scroll');
            scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', category);
            const table = element('table', undefined, 'rnd-rank-table');
            const caption = element('caption', `${category} by rank`); table.appendChild(caption);
            const head = element('thead'), header = element('tr');
            for (const label of ['Item', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5']) {
                const th = element('th', label); th.scope = 'col'; header.appendChild(th);
            }
            head.appendChild(header); table.appendChild(head);
            const body = element('tbody');
            for (const group of groups.filter(group => group.category === category)) {
                const row = element('tr'), label = element('th', group.name); label.scope = 'row'; row.appendChild(label);
                for (let rank = 1; rank <= 5; rank++) {
                    const cell = element('td');
                    const entry = group.entries.find(entry => entry.rank === rank);
                    if (entry) cell.appendChild(card(entry));
                    else { cell.textContent = '—'; cell.setAttribute('aria-label', 'No variant at this rank'); }
                    row.appendChild(cell);
                }
                body.appendChild(row);
            }
            table.appendChild(body); scroll.appendChild(table); section.appendChild(scroll); container.appendChild(section);
        }
        if (focusId && focusControl) {
            const card = container.querySelector(`[data-item-id="${focusId}"]`);
            const target = card?.querySelector(`[data-control="${focusControl}"]`) || card?.querySelector('[data-control="developed"]');
            if (target && !target.disabled) target.focus({preventScroll: true});
        }
        container.querySelectorAll('.rnd-table-scroll').forEach((el, i) => { el.scrollLeft = scrolls[i] || 0; });
        if ($('rnd')) $('rnd').scrollTop = panelTop;
    }
    document.querySelectorAll('[data-rnd-bulk="items"]').forEach(button => {
        button.addEventListener('click', () => {
            if (!save) return;
            const action = button.dataset.action;

            try {
                flushPendingEdits();
                const changed = save.bulkRnD('items', action);
                if (changed) {
                    changesSinceExport = true;
                    global.dispatchEvent(new Event('vicboss:items-changed'));
                }
                render(); message(changed ? `Updated ${changed} items variants.` : 'No changes needed.');
            } catch (error) {
                console.error('Bulk R&D edit failed', error); message(error.message || String(error), true);
            }
        });
    });
    function setSave(newSave) {
        document.querySelectorAll('[data-rnd-bulk="items"]').forEach(button => { button.disabled = !newSave; });
        save = newSave; changesSinceExport = false;
        message(''); selectTab('weapons'); render();
        if ($('rnd')) $('rnd').scrollTop = 0;
        document.querySelectorAll('#rnd-item-categories .rnd-table-scroll').forEach(el => { el.scrollLeft = 0; });
    }
    global.VicbossRnDUI = Object.freeze({setSave, selectTab, render, flushPendingEdits,
        hasUnexportedChanges: () => Boolean(save && changesSinceExport),
        markExported: () => { changesSinceExport = false; }
    });
})(window);
