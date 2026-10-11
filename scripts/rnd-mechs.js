// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Captured mech parsing and guarded LIFE editing, PC save format.
   Count at 0x115D8; 50 slots at 0x115E8, stride 0xA0.
   Name +0x20, occupied bit +0x34 & 1, removal bit +0x34 & 2,
   OUTER OPS bit +0x34 & 0x80. Removed records can remain after the active roster.
   LIFE +0x42 varies with damage in older saves; +0x44 is model capacity.
   Round upward, verified in-game: 7251/8000 -> 91%, 2040/4000 -> 51%,
   and 3088/4000 -> 78%. The last case distinguishes ceiling from nearest
   rounding; exact whole percentages remain unchanged.
   +0x46 is NOT the denominator: it exceeds full LIFE for regular models. */
(function (global) {
    'use strict';
    const BASE = 0x115E8, STRIDE = 0xA0, CAPACITY = 50;
    // Model order supplied from the in-game R&D list. Slot order is capture order.
    const MODEL_ORDER = Object.freeze([
        'BTR-60PA', 'BTR-60PA(C)', 'BTR-60PB', 'BTR-60PB(C)',
        'LAV-G', 'LAV-G(C)', 'LAV-C', 'LAV-C(C)',
        'T-72U', 'T-72U(C)', 'T-72A', 'T-72A(C)',
        'KPZ 70', 'KPZ 70(C)', 'MBTK-70', 'MBTK-70(C)',
        'MI-24A', 'MI-24A(C)', 'MI-24D', 'MI-24D(C)',
        'AH56A-B', 'AH56A-B(C)', 'AH56A-R', 'AH56A-R(C)'
    ]);
    // Observed complete model payloads. Per-unit identity and owner are never
    // imported from the reference save; they are supplied by add() below.
    const TEMPLATES = Object.freeze({
    "BTR-60PA": "4254522d3630504100000000000000000025030201000000db170000dae08e001200ac0dac0d68101100401f401f401f5800e001e001e001f000400140014001dc05000050006400500064002800320050006400030000005f00000000008403000089020a000a00000000000000000000000000000000000000000000000000",
    "BTR-60PA(C)": "4254522d36305041284329000000000000600602010000002c190000dae08e002900a00fa00fa00f5100401f401f401f2600e001e001e001f000400140014001d007000050006400500064002800320050006400030000005f000000000084030000b0020a000a00000000000000000000000000000000000000000000000000",
    "BTR-60PB": "4254522d363050420000000000000000002603020100000013180000dae08e001300ac0dac0d68105400401f401f401f2f00e001e001e001f000400140014001d606000050006400500064000000000050006400030000005f000000000084030000e1010a000a00000000000000000000000000000000000000000000000000",
    "BTR-60PB(C)": "4254522d36305042284329000000000000610602010000000d1a0000dae08e002a009411941194116200401f401f401f5a00e001e001e001f000400140014001d007000050006400000000002800320000000000030000005f0000000000840300009e010a000a00000000000000000000000000000000000000000000000000",
    "LAV-G": "4c41562d4700000000000000000000000027030201000000bc180000dae08e001400a00fa00fc0122f00401f401f401f5d00e001e001e001f000400140014001dc05000050006400500064002800320050006400030000005f00000000008403000068020a000a00000000000000000000000000000000000000000000000000",
    "LAV-G(C)": "4c41562d47284329000000000000000000620602010000007e1a0000dae08e002b009411941194115200401f401f401f4b00e001e001e001f000400140014001c409000050006400500064002800320050006400030000005f00000000008403000039020a000a00000000000000000000000000000000000000000000000000",
    "LAV-C": "4c41562d4300000000000000000000000028030201000000d5190000dae08e0015009411941118154c00401f401f401f0b00e001e001e0010000400140014001d606000050006400500064002800320000000000030000005f000000000084030000e1010a000a00000000000000000000000000000000000000000000000000",
    "LAV-C(C)": "4c41562d43284329000000000000000000630602010000005f1b0000dae08e002c008813881388130100401f401f401f4600e001e001e001f000400140014001c409000050006400500064000000000050006400030000005f00000000008403000030020a000a00000000000000000000000000000000000000000000000000",
    "T-72U": "542d37325500000000000000000000000029030201000000eb190000dae08e000a009411941118154800401f401f401f2700e001e001e001f0004001400140013a07000000000000500064002800320050006400030000005f0000000000840300005d020a000a00000000000000000000000000000000000000000000000000",
    "T-72U(C)": "542d37325528432900000000000000000058060201000000ad1b0000dae08e0021007c157c157c155200401f401f401f0100e001e001e001f0004001400140013a07000050006400500064002800320050006400030000005f0000000000840300003c020a000a00000000000000000000000000000000000000000000000000",
    "T-72A": "542d3732410000000000000000000000002a030201000000eb190000dae08e000b009411941118152900401f401f401f4c00e001e001e00100004001400140013a07000000000000500064002800320050006400030000005f000000000084030000f7010a000a00000000000000000000000000000000000000000000000000",
    "T-72A(C)": "542d37324128432900000000000000000059060201000000721e0000dae08e002200581b581b581b2000401f401f401f1700e001e001e001f000400140014001d007000050006400500064002800320000000000030000005f00000000008403000073020a000a00000000000000000000000000000000000000000000000000",
    "KPZ 70": "4b505a20373000000000000000000000002b030201000000cc1a0000dae08e000c008813881370173a00401f401f401f4e00e001e001e001f0004001400140013a07000050006400500064002800320050006400030000005f000000000084030000b1010a000a00000000000000000000000000000000000000000000000000",
    "KPZ 70(C)": "4b505a20373028432900000000000000005a0602010000006f1d0000dae08e0023006419641964190f00401f401f401f0900e001e001e001f0004001400140013a07000000000000000000002800320050006400030000005f00000000008403000037020a000a00000000000000000000000000000000000000000000000000",
    "MBTK-70": "4d42544b2d3730000000000000000000002c030201000000d7190000dae08e000d008813881370172500401f401f401f12002c012c012c0100000000960096003a07000050006400280032007800960050006400030000005f0000000000aa0300001b020a000a00000000000000000000000000000000000000000000000000",
    "MBTK-70(C)": "4d42544b2d3730284329000000000000005b0602010000003f1f0000dae08e002400401f401f401f3b00401f401f401f08002c012c012c01c800000000009600d007000000000000280032007800960050006400030000005f0000000000aa030000c0010a000a00000000000000000000000000000000000000000000000000",
    "MI-24A": "4d492d32344100000000000000000000002d030201000000b6160000dae08e000e00b80bb80b100e4a00401f401f401f4700e001e001e001f000400140014001b0040a0050006400500064002800320000000000030000005f00000000008403000098020a000a00000000000000000000000000000000000000000000000000",
    "MI-24A(C)": "4d492d32344128432900000000000000005c06020100000078180000dae08e002500a00fa00fa00f0d00401f401f401f2d00e001e001e001f000400140014001b0040f0050006400500064002800320050006400030000005f000000000084030000b8010a000a00000000000000000000000000000000000000000000000000",
    "MI-24D": "4d492d32344400000000000000000000002e03020100000097170000dae08e000f00ac0dac0d68101400401f401f401f5600e001e001e001f000400140014001b0040f0050006400500064002800320000000000030000005f000000000084030000a7010a000a00000000000000000000000000000000000000000000000000",
    "MI-24D(C)": "4d492d32344428432900000000000000005d0602010000009d190000dae08e0026009411941194113d00401f401f401f4200e001e001e001f000400140014001dc05190050006400500064002800320050006400030000005f000000000084030000c2010a000a00000000000000000000000000000000000000000000000000",
    "AH56A-B": "41483536412d42000000000000000000002f03020100000097170000dae08e001000ac0dac0d68104200401f401f401f2900e001e001e001f000400140014001b0040f0050006400500064002800320050006400030000005f00000000008403000032020a000a00000000000000000000000000000000000000000000000000",
    "AH56A-B(C)": "41483536412d42284329000000000000005e0602010000009d190000dae08e0027009411941194112500401f401f401f6100e001e001e001f000400140014001dc05140050006400500064002800320000000000030000005f0000000000840300001c020a000a00000000000000000000000000000000000000000000000000",
    "AH56A-R": "41483536412d52000000000000000000003003020100000078180000dae08e001100a00fa00fc0121000401f401f401f1300e001e001e0010000400140014001b004140050006400500064000000000050006400030000005f00000000008403000022020a000a00000000000000000000000000000000000000000000000000",
    "AH56A-R(C)": "41483536412d52284329000000000000005f0602010000003a1a0000dae08e0028008813881388135700401f401f401f3b00e001e001e001f000400140014001b0041e0000000000000000002800320050006400030000005f00000000008403000017020a000a00000000000000000000000000000000000000000000000000"
});
    function modelOrder(name) {
        const index = MODEL_ORDER.indexOf(name);
        return index < 0 ? MODEL_ORDER.length : index;
    }
    function category(name) {
        if (/^(BTR-|LAV-)/.test(name)) return 'Armored Vehicles';
        if (/^(T-72|KPZ |MBTK-)/.test(name)) return 'Tanks';
        if (/^(MI-24|AH56)/.test(name)) return 'Helicopters';
        return 'Unidentified Mechs';
    }
    function displayedLifePercent(life, maxLife) {
        return Math.ceil(Math.fround(Math.fround(life / maxLife) * 100));
    }
    function parse(bytes) {
        if (!(bytes instanceof Uint8Array) || bytes.length < BASE + CAPACITY * STRIDE)
            throw new Error('Captured mech table is incomplete');
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const declaredCount = view.getUint32(0x115D8, true);
        const entries = [];
        let pendingRemoval = 0;
        // The count bounds the roster, not the number of retained nonzero slots.
        // Pending removals still occupy counted slots until the game compacts it.
        for (let slot = 0; slot < Math.min(declaredCount, CAPACITY); slot++) {
            const p = BASE + slot * STRIDE, flags = bytes[p + 0x34];
            if (!(flags & 1)) continue;
            if (flags & 2) { pendingRemoval++; continue; }
            let name = '';
            for (let j = 0; j < 16 && bytes[p + 0x20 + j]; j++) {
                const c = bytes[p + 0x20 + j];
                name += c >= 32 && c <= 126 ? String.fromCharCode(c) : '\uFFFD';
            }
            name = name.trim() || 'Unknown mech';
            const life = view.getUint16(p + 0x42, true);
            const maxLife = view.getUint16(p + 0x44, true);
            const lifePercent = maxLife > 0 && life <= maxLife
                ? displayedLifePercent(life, maxLife) : null;
            entries.push(Object.freeze({slot, name, category: category(name),
                assigned: Boolean(flags & 0x80), life, maxLife, lifePercent}));
        }
        entries.sort((a, b) => modelOrder(a.name) - modelOrder(b.name) || a.slot - b.slot);
        return Object.freeze({capacity: CAPACITY, declaredCount,
            countMatches: declaredCount <= CAPACITY && declaredCount === entries.length + pendingRemoval,
            entries: Object.freeze(entries)});
    }
    function editLife(bytes, slot, percent, allowAssigned = false) {
        if (!Number.isInteger(slot) || slot < 0 || slot >= CAPACITY)
            throw new Error('Invalid mech slot');
        if (!Number.isInteger(percent) || percent < 1 || percent > 100)
            throw new Error('Mech LIFE must be a whole percentage from 1 to 100');
        const data = parse(bytes);
        if (!data.countMatches) throw new Error('Mech roster count mismatch; editing is unavailable');
        const entry = data.entries.find(e => e.slot === slot);
        if (!entry) throw new Error('This mech is no longer in the roster');
        if (entry.assigned && allowAssigned !== true) throw new Error('Mechs assigned to OUTER OPS are read-only');
        if (entry.lifePercent === null || entry.life < 1 || !MODEL_ORDER.includes(entry.name))
            throw new Error('This mech has unverified data and cannot be edited');
        const draft = new Uint8Array(bytes);
        // Merely viewing/flushing a rounded value must not alter its underlying LIFE.
        if (percent === entry.lifePercent) return draft;
        let life = Math.floor(entry.maxLife * percent / 100);

        // Avoid floating-point rounding displaying one percentage point too high.
        while (life > 1 && displayedLifePercent(life, entry.maxLife) > percent) {
            life--;
        }

        if (life < 1 || displayedLifePercent(life, entry.maxLife) !== percent) {
            throw new Error('This LIFE percentage cannot be represented for this mech');
        }
        new DataView(draft.buffer).setUint16(BASE + slot * STRIDE + 0x42, life, true);
        return draft;
    }
    function healAll(bytes, allowAssigned = false) {
        const data = parse(bytes);
        if (!data.countMatches) throw new Error('Mech roster count mismatch; editing is unavailable');
        let draft = new Uint8Array(bytes);
        for (const entry of data.entries) {
            if (entry.assigned && allowAssigned !== true) continue;
            // Reuse the individual edit guards, including model and LIFE checks.
            draft = editLife(draft, entry.slot, 100, allowAssigned);
            // A damaged mech may already round up to 100%. This explicit action
            // restores full raw LIFE; ordinary field flushing remains a no-op.
            new DataView(draft.buffer).setUint16(BASE + entry.slot * STRIDE + 0x42, entry.maxLife, true);
        }
        return draft;
    }
    function validRoster(bytes) {
        const data = parse(bytes);
        if (!data.countMatches) throw new Error('Mech roster count mismatch; editing is unavailable');
        return data;
    }
    function remove(bytes, slot) {
        const data = validRoster(bytes);
        if (!Number.isInteger(slot)) throw new Error('Invalid mech slot');
        const entry = data.entries.find(e => e.slot === slot);
        if (!entry) throw new Error('This mech is no longer in the roster');
        if (entry.assigned) throw new Error('Mechs assigned to OUTER OPS are read-only');
        const draft = new Uint8Array(bytes);
        // The game compacts pending removals and decrements the count itself.
        // Never shift assigned records or decrement this count a second time.
        draft[BASE + slot * STRIDE + 0x34] |= 2;
        return {bytes: draft, slot};
    }
    function add(bytes, model) {
        if (!MODEL_ORDER.includes(model)) throw new Error('Unknown mech model');
        const data = validRoster(bytes);
        if (data.entries.length >= CAPACITY) throw new Error('The 50-mech limit has been reached');
        let slot = -1;
        for (let i = 0; i < data.declaredCount; i++) {
            const flags = bytes[BASE + i * STRIDE + 0x34];
            if ((flags & 2) && !(flags & 0x80)) { slot = i; break; }
        }
        const append = slot < 0;
        if (append) slot = data.declaredCount;
        if (slot >= CAPACITY) throw new Error('No available mech slot');
        // Obtain this save's owner header from one of its own unit records.
        let owner = null, highest = 0n;
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        for (const [base, count] of [[BASE, CAPACITY], [0x1FA80, 350]]) {
            for (let i = 0; i < count; i++) {
                const p = base + i * STRIDE;
                if (!(bytes[p + 0x34] & 1)) continue;
                if (!owner) owner = bytes.slice(p, p + 16);
                const identity = view.getBigUint64(p + 0x10, true);
                if (identity > highest) highest = identity;
            }
        }
        if (!owner) throw new Error('No existing unit owner record is available');
        const identityBytes = new Uint8Array(8), identityView = new DataView(identityBytes.buffer);
        function exists(needle) {
            outer: for (let i = 0; i <= bytes.length - 8; i++) {
                for (let j = 0; j < 8; j++) if (bytes[i + j] !== needle[j]) continue outer;
                return true;
            }
            return false;
        }
        do {
            highest++;
            if (highest > 0xFFFFFFFFFFFFFFFFn) throw new Error('Unable to allocate a distinct mech identity');
            identityView.setBigUint64(0, highest, true);
        } while (exists(identityBytes));
        const draft = new Uint8Array(bytes), p = BASE + slot * STRIDE;
        draft.fill(0, p, p + STRIDE);
        draft.set(owner, p); draft.set(identityBytes, p + 0x10);
        draft[p + 0x18] = 8;
        draft.set(Uint8Array.from(TEMPLATES[model].match(/../g), h => parseInt(h, 16)), p + 0x20);
        // Occupied, in storage and unseen: neither assigned nor pending removal.
        draft[p + 0x34] = 1;
        const dv = new DataView(draft.buffer);
        dv.setUint16(p + 0x42, dv.getUint16(p + 0x44, true), true);
        if (append) dv.setUint32(0x115D8, data.declaredCount + 1, true);
        return {bytes: draft, slot};
    }
    global.VicbossRnDMechs = Object.freeze({parse, editLife, healAll, add, remove, models: MODEL_ORDER});
})(window);
