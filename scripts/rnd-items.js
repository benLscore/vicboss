// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* R&D item records and guarded editing.
   Plaintext: 0xE2E8 + ID * 0x18. Ration I/II state, endpoints and stock
   verified using controlled PC saves. Other item labels derive from the trainer
   catalogue (sagefantasma/MGSPW-Cheat-Trainer, commit 3d071b8a6b6d2ea413ceec807756ba5f7b83bd48).
   Item names/ranks cross-checked by the user in-game.
   https://gamefaqs.gamespot.com/xbox360/632820-metal-gear-solid-peace-walker-hd-edition/faqs/60162
   https://gamefaqs.gamespot.com/boards/960566-metal-gear-solid-peace-walker/60011258
   Byte +0x12 changes from 0x04 to 0x06 when an item's NEW label
   is dismissed (controlled Fulton II saves); its low bit differs between
   items, so the NEW test ignores that bit. No notification writes. */
(function (global) {
    'use strict';
    const groups = [];
    const startingIds = new Set([0xDC, 0xF6, 0xFE, 0x11C, 0x141, 0x142, 0x143, 0x14C]);
    const maxStock = 9999;
    const fixedStockNames = new Set(['Analyzer', 'Night Vision Goggles', 'Sonic Eye',
        'Binoculars', 'Camera', 'Walkman', 'ID Card (Huey)', 'Stealth Camouflage',
        'Bandana', 'Surround Indicator', 'Soliton Radar']);
    function add(category, name, firstId, firstRank, count, obtainedOnly = false) {
        groups.push(Object.freeze({category, name, entries: Object.freeze(
            Array.from({length: count}, (_, i) => Object.freeze({id: firstId + i, rank: firstRank + i, name, obtainedOnly, fixedStock: fixedStockNames.has(name), readOnly: startingIds.has(firstId + i)}))
        )}));
    }
    add('Recovery Items', 'Ration', 0xDC, 1, 5);
    add('Recovery Items', 'Rare Ration', 0xE1, 1, 5, true);
    add('Recovery Items', 'Well-Done Ration', 0xE6, 1, 5, true);
    add('Recovery Items', 'Burnt Ration', 0xEB, 1, 5, true);
    add('Recovery Items', 'Spicy Curry', 0xF0, 1, 2);
    add('Recovery Items', 'Great Curry', 0xF2, 3, 2);
    add('Recovery Items', 'Future Curry', 0xF4, 5, 1);
    add('Recovery Items', 'Tortilla Chips', 0xF5, 1, 1);
    add('Recovery Items', 'Mate Tea', 0xF6, 1, 5);
    add('Recovery Items', 'Lime Soda', 0xFB, 1, 1);
    add('Recovery Items', 'Zero Calorie Soda', 0xFC, 2, 1);
    add('Recovery Items', 'Cologne', 0xFD, 1, 1);
    add('Equipment', 'Fulton Recovery System', 0xFE, 1, 5);
    add('Equipment', 'Analyzer', 0x103, 1, 5);
    add('Equipment', 'Shield', 0x108, 1, 5);
    add('Equipment', 'Shield (Colored)', 0x10D, 1, 5);
    add('Equipment', 'Night Vision Goggles', 0x112, 1, 5);
    add('Equipment', 'Sonic Eye', 0x117, 1, 5);
    add('Equipment', 'Love Box', 0x11C, 1, 5);
    add('Equipment', 'Box-Tank', 0x121, 1, 5);
    add('Equipment', 'Box-Tank (Stun)', 0x126, 2, 4);
    add('Equipment', 'Box-Tank (Smoke)', 0x12A, 2, 4);
    add('Equipment', 'Box Bomb', 0x12E, 1, 5);
    add('Equipment', 'Stun Box', 0x133, 2, 4);
    add('Equipment', 'Smoke Box', 0x137, 2, 4);
    add('Equipment', 'Assassin Box', 0x13B, 1, 1);
    add('Equipment', 'Rescue Box', 0x13C, 1, 5);
    add('Equipment', 'Binoculars', 0x141, 1, 1);
    add('Equipment', 'Camera', 0x142, 1, 1);
    add('Equipment', 'Walkman', 0x143, 1, 4);
    add('Equipment', 'ID Card (Huey)', 0x147, 1, 1);
    add('Equipment', 'Stealth Mat', 0x148, 1, 2);
    add('Equipment', 'Stealth Camouflage', 0x14A, 5, 1);
    add('Equipment', 'Bandana', 0x14B, 1, 1);
    add('Radars', 'Surround Indicator', 0x14C, 1, 2);
    add('Radars', 'Soliton Radar', 0x14E, 1, 5);
    const catalogue = Object.freeze(groups);
    const categories = Object.freeze(['Recovery Items', 'Equipment', 'Radars']);
    function parse(bytes) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return Object.freeze(catalogue.map(group => Object.freeze({...group,
            entries: Object.freeze(group.entries.map(entry => {
                const offset = 0xE2E8 + entry.id * 0x18;
                if (offset + 0x18 > view.byteLength || view.getUint32(offset, true) !== entry.id) {
                    return Object.freeze({...entry, available: false, state: null, progress: null, stock: null, isNew: false});
                }
                return Object.freeze({...entry, available: true,
                    state: view.getUint32(offset + 4, true),
                    progress: view.getUint32(offset + 8, true),
                    stock: view.getUint32(offset + 12, true),
                    isNew: view.getUint32(offset + 4, true) === 3 &&
                        (view.getUint8(offset + 0x12) & 0x06) === 0x04
                });
            }))
        })));
    }
    function context(bytes, id) {
        if (!Number.isInteger(id)) throw Error('Invalid item selection.');
        const group = parse(bytes).find(g => g.entries.some(e => e.id === id));
        const entry = group?.entries.find(e => e.id === id);
        if (!entry?.available || !(entry.obtainedOnly ? [1, 3] : [1, 2, 3]).includes(entry.state)) throw Error('This item cannot be edited because its saved state is unavailable or unknown.');
        return {group, entry};
    }
    function developmentPlan(bytes, id, developed) {
        if (typeof developed !== 'boolean') throw Error('Developed must be true or false.');
        const {group, entry} = context(bytes, id);
        if (entry.readOnly) throw Error('Starting equipment development is read-only.');
        // These ration variants are obtained separately, not developed in a chain.
        if (entry.obtainedOnly) return Object.freeze((entry.state === 3) === developed ? [] : [entry]);
        // Only preceding ranks in the same catalogue row are included. No inferred
        // cross-row dependencies (such as Box-Tank -> Box-Tank Stun) are imposed.
        const related = group.entries.filter(e => developed ? e.rank <= entry.rank : e.rank > entry.rank);
        if (related.some(e => !e.available || ![1, 2, 3].includes(e.state))) throw Error('The other ranks in this item chain could not be verified.');
        if (!developed && related.some(e => e.state === 2 || e.state === 3)) {
            throw Error('Remove later developed ranks first. A later rank being developed also prevents this change.');
        }
        const changes = developed ? related.filter(e => e.state !== 3) : entry.state === 3 ? [entry] : [];
        if (changes.some(e => e.readOnly)) throw Error('A required starting item is not developed; this chain cannot be changed.');
        return Object.freeze(changes);
    }
    function edit(bytes, id, patch) {
        if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw Error('Invalid item edit.');
        const keys = Object.keys(patch);
        if (keys.some(k => !['developed', 'completeDevelopment', 'stock'].includes(k))) throw Error('Unsupported item edit.');
        const {entry} = context(bytes, id);
        if ('developed' in patch && 'completeDevelopment' in patch) throw Error('Choose one development operation.');
        let changes = [];
        let developed = entry.state === 3;
        if ('completeDevelopment' in patch) {
            if (entry.obtainedOnly) throw Error('This item is obtained rather than developed.');
            if (patch.completeDevelopment !== true || entry.state !== 2) throw Error('This item is not currently being developed.');
            changes = developmentPlan(bytes, id, true); developed = true;
        } else if ('developed' in patch) {
            changes = developmentPlan(bytes, id, patch.developed);
            developed = patch.developed;
        }
        if ('stock' in patch && entry.fixedStock && patch.stock !== 1) throw Error('This item has a fixed inventory of 1.');
        if ('stock' in patch && (!developed || !Number.isInteger(patch.stock) || patch.stock < 0 || patch.stock > maxStock)) {
            throw Error(`Stock must be an integer from 0 to ${maxStock} for a developed item.`);
        }
        const draft = new Uint8Array(bytes);
        const view = new DataView(draft.buffer, draft.byteOffset, draft.byteLength);
        for (const item of changes) {
            const offset = 0xE2E8 + item.id * 0x18;
            view.setUint32(offset + 4, developed ? 3 : 1, true);
            view.setUint32(offset + 8, developed ? 100 : 0, true);
            if (developed && item.fixedStock) view.setUint32(offset + 12, 1, true);
        }
        if ('stock' in patch) view.setUint32(0xE2E8 + id * 0x18 + 12, patch.stock, true);
        return draft;
    }
    global.VicbossRnDItems = Object.freeze({catalogue, categories, maxStock, parse, developmentPlan, edit});
})(window);
