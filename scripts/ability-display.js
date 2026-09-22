// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Derived display only. Medical ability penalties are provisional pending numeric tests. */
(function (global) {
    'use strict';
    function calculate(base, morale, conditions = {}) {
        if (!Number.isFinite(base) || base < 0 || !Number.isFinite(morale)) return { effective: NaN, kind: 'invalid', estimated: false };
        const w = conditions.wounded || 0, s = conditions.sick || 0, p = conditions.ptsd || 0, h = conditions.hostilityRaw || 0;
        if (w > 0 || s > 0 || p > 0) {
            const percentages = [100];
            if (w > 0) percentages.push(Math.max(20, Math.min(60, 100 - w)));
            if (s > 0) percentages.push(60);
            if (p > 0) percentages.push(Math.max(20, Math.min(60, 100 - p)));
            const percent = Math.min(...percentages);
            return { effective: Math.ceil(base * percent / 100), kind: 'medical', estimated: true, percent };
        }
        if (h > 0) return { effective: Math.floor(base), kind: 'hostility', estimated: false };
        return { effective: Math.floor(base * (morale <= 500 ? 1 : (2500 + morale - 500) / 2500)), kind: 'morale', estimated: false };
    }
    global.PWSEAbilityDisplay = Object.freeze({ calculate });
})(window);
