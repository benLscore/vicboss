// THIS SCRIPT WAS CREATED USING GENERATIVE AI
(function (global) {
    'use strict';
    let save = null, changesSinceExport = false;
    const $ = id => document.getElementById(id);
    function element(tag, text) {
        const el = document.createElement(tag);
        if (text !== undefined) el.textContent = text;
        return el;
    }
    function message(error) {
        const el = $('rnd-other-error');
        if (el) { el.textContent = error ? error.message || String(error) : ''; el.hidden = !error; }
        if (error) console.error('Other edit failed', error);
    }
    function apply(id, patch) {
        try {
            if (!save) return false;
            const before = save.rndOther.flatMap(g => g.entries).find(e => e.id === id);
            save.updateOther(id, patch);
            const after = save.rndOther.flatMap(g => g.entries).find(e => e.id === id);
            if (before.owned !== after.owned || before.stock !== after.stock) {
                changesSinceExport = true;
                global.dispatchEvent(new Event('vicboss:other-changed'));
            }
            message(null); return true;
        } catch (error) { message(error); return false; }
    }
    function commitStock(input) {
        const id = Number(input.dataset.otherStock);
        const entry = save?.rndOther.flatMap(g => g.entries).find(e => e.id === id);
        if (!entry) return;
        if (input.value.trim() === '' || !Number.isFinite(input.valueAsNumber)) {
            input.value = String(entry.stock); return;
        }
        const value = Math.min(9999, Math.max(0, Math.trunc(input.valueAsNumber)));
        input.value = String(value);
        if (!apply(id, {stock: value})) input.value = String(entry.stock);
    }
    function flushPendingEdits() {
        $('rnd-other-categories')?.querySelectorAll('[data-other-stock]').forEach(commitStock);
    }
    function render() {
        const host = $('rnd-other-categories'); if (!host) return;
        const focused = document.activeElement?.id;
        const top = $('rnd')?.scrollTop || 0;
        const scrolls = Array.from(host.querySelectorAll('.rnd-table-scroll'), el => el.scrollLeft);
        host.replaceChildren();
        const error = element('p'); error.id = 'rnd-other-error'; error.hidden = true;
        error.className = 'rnd-edit-error'; error.setAttribute('role', 'alert'); host.appendChild(error);
        if (!save?.rndOther) { host.appendChild(element('p', 'Load a save to view Other inventory.')); return; }
        function bulkButton(text, action, id) {
            const button = element('button', text); button.type = 'button'; button.id = id;
            button.addEventListener('click', () => {
                try {
                    flushPendingEdits();
                    if (save.bulkOther(action)) {
                        changesSinceExport = true;
                        global.dispatchEvent(new Event('vicboss:other-changed'));
                    }
                    render();
                } catch (error) { message(error); }
            });
            return button;
        }
        const actions = element('p');
        actions.className = 'rnd-bulk-actions';
        actions.appendChild(bulkButton('Unlock Everything', 'unlock', 'rnd-other-unlock-all'));
        actions.appendChild(bulkButton('Max Inventory Level', 'stock', 'rnd-other-max-stock'));
        host.appendChild(actions);
        for (const group of save.rndOther) {
            const section = element('section'); section.appendChild(element('h3', group.label));
            section.appendChild(element('p', `${group.entries.filter(e => e.owned === true).length} obtained out of ${group.entries.length} mapped entries`));
            const scroll = element('div'); scroll.className = 'rnd-table-scroll'; scroll.tabIndex = 0;
            scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', group.label);
            const grid = element('div'); grid.className = 'rnd-other-grid';
            for (const entry of group.entries) {
                const card = element('div'); card.className = 'rnd-other-card'; card.appendChild(element('h4', entry.name));
                const label = element('label'), checkbox = element('input');
                checkbox.type = 'checkbox'; checkbox.id = `other-owned-${entry.id}`;
                checkbox.checked = entry.owned === true; checkbox.disabled = !entry.available || entry.owned === null;
                checkbox.setAttribute('aria-label', `${entry.name}: Obtained`);
                checkbox.addEventListener('change', () => {
                    flushPendingEdits();
                    if (apply(entry.id, {owned: checkbox.checked})) render();
                    else checkbox.checked = entry.owned === true;
                });
                label.appendChild(checkbox); label.appendChild(document.createTextNode(' Obtained')); card.appendChild(label);
                if (!entry.available || entry.owned === null) card.appendChild(element('p', !entry.available ? 'Unavailable' : 'Unknown ownership state'));
                if (group.key === 'bullets' && entry.owned === true) {
                    const stockLabel = element('label', 'Stock '), input = element('input');
                    input.type = 'number'; input.min = '0'; input.max = '9999'; input.step = '1';
                    input.id = `other-stock-${entry.id}`; input.dataset.otherStock = String(entry.id); input.value = String(entry.stock);
                    input.setAttribute('aria-label', `${entry.name}: Stock`);
                    input.addEventListener('input', () => { if (input.value !== '' && Number.isFinite(input.valueAsNumber)) commitStock(input); });
                    input.addEventListener('change', () => commitStock(input));
                    input.addEventListener('blur', () => commitStock(input));
                    stockLabel.appendChild(input); card.appendChild(stockLabel);
                }
                grid.appendChild(card);
            }
            scroll.appendChild(grid); section.appendChild(scroll); host.appendChild(section);
        }
        if (focused) $(focused)?.focus({preventScroll: true});
        host.querySelectorAll('.rnd-table-scroll').forEach((el, i) => { el.scrollLeft = scrolls[i] || 0; });
        if ($('rnd')) $('rnd').scrollTop = top;
    }
    function setSave(next) { save = next || null; changesSinceExport = false; render(); }
    function createCheckpoint() {
        const previous = {save, changesSinceExport};
        return () => { ({save, changesSinceExport} = previous); };
    }
    global.VicbossRnDOtherUI = Object.freeze({setSave, render, createCheckpoint, flushPendingEdits,
        hasUnexportedChanges: () => Boolean(save && changesSinceExport),
        markExported: () => { changesSinceExport = false; }
    });
})(window);
