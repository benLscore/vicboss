// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
Vicboss staff editor: persistent edits with live ability and GMP displays.

Editable: name, LIFE, PSYCHE, base GMP, morale, department/combat abilities,
ordinary tag/title, same-gender portrait/quote, and four skill slots.
Clear Statuses removes all conditions and transfers affected staff to Waiting Room.
Gender/location and derived overall Combat remain read-only.
Unique staff and Hideo have opt-in stat editing; OUTER OPS staff cannot be edited.
*/
(function (global) {
    "use strict";

    let save = null;
    let selectedIndex = null;
    let uploadedNames = new Map();
    let formDirty = false;
    let suppressFormEvents = false;
    let changesSinceExport = false;

    const $ = id => document.getElementById(id);

    const EDITABLE_IDS = Object.freeze([
        "staff-name-input", "staff-tag", "staff-title", "staff-quote-choice", "staff-portrait-choice",
        "staff-clear-statuses", "staff-max-abilities", "staff-max-vitals", "staff-max-everything",
        "staff-gmp", "staff-morale", "staff-life", "staff-psyche",
        "staff-rd-slider", "staff-rd-num",
        "staff-messhall-slider", "staff-messhall-num",
        "staff-medical-slider", "staff-medical-num",
        "staff-intel-slider", "staff-intel-num",
        "staff-shoot-slider", "staff-shoot-num",
        "staff-reload-slider", "staff-reload-num",
        "staff-throw-slider", "staff-throw-num",
        "staff-place-slider", "staff-place-num",
        "staff-walkspeed-slider", "staff-walkspeed-num",
        "staff-runspeed-slider", "staff-runspeed-num",
        "staff-fight-slider", "staff-fight-num",
        "staff-defense-slider", "staff-defense-num",
        "staff-skill-1", "staff-skill-2", "staff-skill-3", "staff-skill-4"
    ]);

    const DEPARTMENT_MAP = Object.freeze({
        rd: "rd",
        mess: "messhall",
        medical: "medical",
        intel: "intel"
    });

    const COMBAT_MAP = Object.freeze({
        shoot: "shoot",
        reload: "reload",
        throw: "throw",
        place: "place",
        walkSpeed: "walkspeed",
        runSpeed: "runspeed",
        fight: "fight",
        defense: "defense"
    });

    function setValue(id, value) {
        const el = $(id);
        if (el) el.value = value ?? "";
    }

    function setText(id, value) {
        const el = $(id);
        if (el) el.textContent = value ?? "";
    }

    function setRangeAndNumber(prefix, value) {
        setValue(`staff-${prefix}-slider`, value);
        setValue(`staff-${prefix}-num`, value);
    }

    function combatGrade(value) {
        const v = Number(value);
        if (!Number.isFinite(v) || v < 0) return "?";
        if (v <= 0) return "-";
        if (v < 250) return "E";
        if (v < 500) return "D";
        if (v < 750) return "C";
        if (v < 1000) return "B";
        if (v < 1250) return "A";
        return "S";
    }

    function departmentGrade(value) {
        const v = Number(value);
        if (!Number.isFinite(v) || v < 0) return "?";
        if (v <= 0) return "-";
        if (v < 200) return "E";
        if (v < 400) return "D";
        if (v < 600) return "C";
        if (v < 800) return "B";
        if (v < 999) return "A";
        return "S";
    }

    function combatOverallFromValues(baseValues, morale, conditions = currentSoldier()?.conditions || {}) {
        if (!baseValues.length || baseValues.some(v => !Number.isFinite(v))) {
            return { base: null, effective: null, grade: "?" };
        }

        const effectiveValues = baseValues.map(
            v => Math.min(1250, global.PWSEAbilityDisplay.calculate(v, morale, conditions).effective)
        );
        const base = Math.floor(baseValues.reduce((a, b) => a + b, 0) / baseValues.length);
        const effective = Math.floor(
            effectiveValues.reduce((a, b) => a + b, 0) / effectiveValues.length
        );

        return {
            base,
            effective,
            grade: combatGrade(effective)
        };
    }

    function combatOverall(soldier) {
        return combatOverallFromValues(
            Object.values(soldier.combatAbilities),
            soldier.conditions.morale, soldier.conditions
        );
    }

    function draftNumber(id) {
        const el = $(id);
        if (!el) return NaN;
        const raw = String(el.value).trim();
        if (raw === "") return NaN;
        const n = Number(raw);
        return Number.isFinite(n) ? n : NaN;
    }

    function draftMorale() {
        return draftNumber("staff-morale");
    }

    function installAbilityBars() {
        for (const prefix of [...Object.values(DEPARTMENT_MAP), ...Object.values(COMBAT_MAP), "combat"]) {
            const slider = $(`staff-${prefix}-slider`);
            if (!slider || slider.parentElement.classList.contains("ability-bar")) continue;
            const bar = document.createElement("div");
            bar.className = "ability-bar";
            slider.parentNode.insertBefore(bar, slider);
            bar.appendChild(slider);
            slider.setAttribute("aria-label", prefix === "combat" ? "Calculated overall combat" : `${prefix} stored base ability`);
        }
    }

    function updateAbilityBar(prefix, base, effective, message) {
        const slider = $(`staff-${prefix}-slider`), bar = slider?.parentElement;
        if (!slider || !bar?.classList.contains("ability-bar")) return;
        const max = prefix === "combat" || Object.values(COMBAT_MAP).includes(prefix) ? 1250 : 999;
        const pct = v => Math.max(0, Math.min(100, v / max * 100));
        const valid = Number.isFinite(base) && Number.isFinite(effective);
        const b = valid ? pct(base) : 0, e = valid ? pct(effective) : 0;
        const solid = Math.min(b, e), top = Math.max(b, e);
        const colour = e < b ? "#961414" : "#ff5703";
        bar.style.background = `linear-gradient(to top, #ff1414 0%, #ff1414 ${solid}%, ${colour} ${solid}%, ${colour} ${top}%, rgba(65,65,53,1) ${top}%, rgba(65,65,53,1) 100%)`;
        bar.title = message;
        slider.setAttribute("aria-valuetext", message);
        bar.classList.toggle("ability-bar-readonly", slider.disabled);
    }

    function exposeMoraleDisplay(prefix, base, effective) {
        const gradeEl = $(`staff-${prefix}-grade`);
        const slider = $(`staff-${prefix}-slider`);
        const num = $(`staff-${prefix}-num`);

        const valid = Number.isFinite(base) && Number.isFinite(effective);
        const state = global.PWSEAbilityDisplay.calculate(base, draftMorale(), currentSoldier()?.conditions);
        const message = valid
            ? `Stored/base: ${base} | ${state.estimated ? "Illness-adjusted" : "Effective"}: ${effective}`
            : "Enter valid base values and morale.";
        updateAbilityBar(prefix, base, effective, message);

        for (const el of [gradeEl, slider, num]) {
            if (!el) continue;
            el.title = message;
            if (valid) {
                el.dataset.baseValue = String(base);
                el.dataset.moraleAdjustedValue = String(effective);
            } else {
                delete el.dataset.baseValue;
                delete el.dataset.moraleAdjustedValue;
            }
        }
    }

    function refreshDraftDepartmentGrade(prefix) {
        const base = draftNumber(`staff-${prefix}-num`);
        const effective = global.PWSEAbilityDisplay.calculate(base, draftMorale(), currentSoldier()?.conditions).effective;
        setText(`staff-${prefix}-grade`, departmentGrade(effective));
        exposeMoraleDisplay(prefix, base, effective);
    }

    function refreshDraftCombatGrade(prefix) {
        const base = draftNumber(`staff-${prefix}-num`);
        const effective = global.PWSEAbilityDisplay.calculate(base, draftMorale(), currentSoldier()?.conditions).effective;
        setText(`staff-${prefix}-grade`, combatGrade(effective));
        exposeMoraleDisplay(prefix, base, effective);
    }

    function refreshDraftOverallCombat() {
        const bases = Object.values(COMBAT_MAP).map(
            prefix => draftNumber(`staff-${prefix}-num`)
        );
        const overall = combatOverallFromValues(bases, draftMorale());

        // The disabled overall number remains the average STORED/BASE value.
        // Its grade follows the morale-adjusted approximation used by the editor.
        if (overall.base !== null) {
            setRangeAndNumber("combat", overall.base);
        }
        setText("staff-combat-grade", overall.grade);

        const gradeEl = $("staff-combat-grade");
        const slider = $("staff-combat-slider");
        const num = $("staff-combat-num");
        const message = overall.base === null
            ? "Enter valid combat values and morale."
            : `Stored/base average: ${overall.base} | Effective average: ${overall.effective} (derived)`;

        updateAbilityBar("combat", overall.base, overall.effective, message);
        for (const el of [gradeEl, slider, num]) {
            if (!el) continue;
            el.title = message;
            if (overall.base !== null) {
                el.dataset.baseValue = String(overall.base);
                el.dataset.moraleAdjustedValue = String(overall.effective);
            }
        }
    }

    function refreshAllDraftGrades() {
        for (const prefix of Object.values(DEPARTMENT_MAP)) {
            refreshDraftDepartmentGrade(prefix);
        }
        for (const prefix of Object.values(COMBAT_MAP)) {
            refreshDraftCombatGrade(prefix);
        }
        refreshDraftOverallCombat();
    }

    function option(select, value, text) {
        const o = document.createElement("option");
        o.value = String(value);
        o.textContent = text;
        select.appendChild(o);
        return o;
    }

    // Supports the existing selects or user-authored text/textarea elements.
    function showReadOnly(id, value, text, note = '') {
        const el = $(id);
        if (!el) return;
        if (el.tagName === 'SELECT') {
            el.innerHTML = '';
            option(el, value, text);
            el.value = String(value);
            el.disabled = true;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = text;
            el.readOnly = true;
        } else {
            el.textContent = text;
        }
        el.title = note;
    }
    function populateOrdinarySelect(id, current, names, excluded = []) {
        const el = $(id);
        if (!el) return;
        if (el.tagName !== "SELECT") {
            setText(id, current.label);
            return;
        }
        el.replaceChildren();
        const codes = Object.keys(names).map(Number).filter(code => !excluded.includes(code));
        if (!codes.includes(current.code)) {
            option(el, current.code, current.label + " (existing value — keep)");
        }
        for (const code of codes.sort((a, b) => a - b)) option(el, code, names[code]);
        el.value = String(current.code);
    }

    function populateTitleSelect(soldier) {
        populateOrdinarySelect("staff-title", soldier.title,
            global.PWSEStaffLookups?.TITLE_NAMES || {},
            global.PWSEStaffLookups?.SPECIAL_ONLY_TITLE_IDS ||
            [0x15, 0x16, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x57]);
    }

    function readChoiceOrCurrent(id, label, currentCode) {
        return $(id)?.tagName === "SELECT" ? readInteger(id, label) : currentCode;
    }

    function skillLabel(code) {
        if (code === 0) return "None";
        const label = global.PWSEStaffLookups?.SKILL_NAMES?.[code];
        return label
            ? label
            : "Unknown skill (keep current)";
    }

    function skillTooltip(code) {
        if (code === 0) return "No skill assigned.";
        const description = global.PWSEStaffLookups?.SKILL_DESCRIPTIONS?.[code];
        return skillLabel(code) + "\n\n" + (description || "Description not yet available.");
    }

    function refreshSkillTooltip(el) {
        if (!el) return;
        el.title = skillTooltip(Number(el.value));
        el.setAttribute("aria-description", el.title);
    }

    function populateSkillSelect(selectId, skill) {
        const el = $(selectId);
        if (!el) return;
        el.innerHTML = "";

        const skills = global.PWSEStaffLookups?.SKILL_NAMES || {};
        const specialOnly = new Set(global.PWSEStaffLookups?.SPECIAL_ONLY_SKILL_IDS || []);
        const codes = Object.keys(skills)
            .map(Number)
            .filter(code => !specialOnly.has(code))
            .sort((a, b) => a - b);

        option(el, 0, "None");

        // Preserve the current value for display even if it is a protected skill.
        if (skill.code !== 0 && !codes.includes(skill.code)) {
            option(el, skill.code, skillLabel(skill.code));
        }

        for (const code of codes) {
            option(el, code, skillLabel(code));
        }

        for (const choice of el.options) choice.title = skillTooltip(Number(choice.value));
        el.value = String(skill.code);
        refreshSkillTooltip(el);
    }

    function descriptionText(soldier) {
        if (!soldier.description) return "Description selector unavailable";

        const mappedGender = soldier.description.mappedGender;
        if (mappedGender && mappedGender !== soldier.genderFlag) {
            return `Current raw selector is mapped for ${mappedGender} staff (${soldier.description.selectorHex})`;
        }

        if (soldier.description.text) return soldier.description.text;
        return `Unmapped description selector (${soldier.description.selectorHex})`;
    }

    function populateDescriptionSelect(soldier) {
        if (soldier.specialReadOnly) {
            const select = $('staff-quote-choice');
            if (select) {
                select.replaceChildren();
                const text = soldier.description?.characterSpecific ? soldier.description.text : 'Character-specific quote (not mapped)';
                option(select, '', text);
                select.title = text;
            }
            showReadOnly('staff-desc', '', soldier.description?.characterSpecific ? soldier.description.text : 'Character-specific quote (not mapped)');
            return;
        }
        const el = $("staff-quote-choice");
        if (el) {
            el.removeAttribute("title");
            el.replaceChildren();
            const key = soldier.description?.key;
            const prefix = soldier.genderFlag === "Male" ? "m" : "f";
            const choices = Object.entries(global.PWSEQuotes?.ordinary || {}).filter(([k]) => k.startsWith(prefix));
            if (!choices.some(([k]) => k === key)) option(el, key || "", "Current quote — keep");
            for (const [k, text] of choices) option(el, k, text);
            el.value = key || "";
        }
        showReadOnly('staff-desc', soldier.description?.selectorHex || '',
            descriptionText(soldier), soldier.description?.note || '');
    }

    function ensureRuntimeStyles() {
        if (document.getElementById("pwse-staff-runtime-style")) return;
        const style = document.createElement("style");
        style.id = "pwse-staff-runtime-style";
        style.textContent = `
            #staff-content.pwse-outerops-locked {
                position: relative !important;
                overflow: hidden !important;
                overscroll-behavior: contain;
            }
            #staff-content.pwse-outerops-locked #staff-outerops-overlay {
                position: absolute !important;
                inset: 0 !important;
                width: auto !important;
                height: auto !important;
                min-height: 100% !important;
                z-index: 9999 !important;
            }
        `;
        document.head.appendChild(style);
    }

    function setControlLimits() {
        for (const id of ['staff-life', 'staff-psyche']) {
            const el = $(id);
            if (el) { el.min = '0'; el.max = '9999'; el.step = '1'; }
        }
        for (const prefix of Object.values(DEPARTMENT_MAP)) {
            const slider = $(`staff-${prefix}-slider`);
            const num = $(`staff-${prefix}-num`);
            if (slider) { slider.min = "0"; slider.max = "999"; }
            if (num) { num.min = "0"; num.max = "999"; }
        }

        for (const prefix of Object.values(COMBAT_MAP)) {
            const slider = $(`staff-${prefix}-slider`);
            const num = $(`staff-${prefix}-num`);
            if (slider) { slider.min = "0"; slider.max = "1250"; }
            if (num) { num.min = "0"; num.max = "1250"; }
        }

        const morale = $("staff-morale");
        if (morale) { morale.min = "0"; morale.max = "999"; }
        const gmp = $("staff-gmp");
        if (gmp) { gmp.min = "0"; gmp.max = "99999"; gmp.step = "1"; }

        // Overall Combat is derived and deliberately not directly editable.
        ["staff-combat-slider", "staff-combat-num"].forEach(id => {
            const el = $(id);
            if (el) el.disabled = true;
        });
    }

    function outerOpsLocked(soldier) { return soldier.outerOps && !save?.outerOpsEditingEnabled; }

    function uniqueEditingEnabled() {
        return Boolean(save?.uniqueStaffEditingEnabled);
    }

    function setEditingState(soldier) {
        const panel = $("staff-content");
        if (!panel) return;

        panel.querySelectorAll("input, select, textarea, button").forEach(el => {
            el.disabled = true;
        });

        if (!outerOpsLocked(soldier) && (!soldier.specialReadOnly || uniqueEditingEnabled())) {
            const restricted = new Set([
                'staff-name-input', 'staff-tag', 'staff-title', 'staff-quote-choice',
                'staff-portrait-choice', 'staff-clear-statuses', 'staff-morale',
                'staff-max-everything', 'staff-skill-1', 'staff-skill-2',
                'staff-skill-3', 'staff-skill-4'
            ]);
            for (const id of EDITABLE_IDS) {
                if (soldier.specialReadOnly && restricted.has(id) && !(soldier.skillsEditable && /^staff-skill-[1-4]$/.test(id))) continue;
                const el = $(id);
                if (el) el.disabled = false;
            }
        }

        // Always keep derived overall Combat read-only.
        ["staff-combat-slider", "staff-combat-num"].forEach(id => {
            const el = $(id);
            if (el) el.disabled = true;
        });
    }

    const PORTRAIT_ASSETS = new Set([13847706,13782170,13716634,12209306,12143770,12078234,12012698,11947162,11881626,11816090,11750554,11685018,11619482,10112154,10046618,9981082,9915546,9850010,9784474,9718938,9653402,9587866,9522330,8015002,7949466,7883930,7818394,7752858,7687322,7621786,7556250,7490714,7425178,5917850,5852314,5786778,5721242,5655706,5590170,5524634,5459098,5393562,5328026,8014999,7949463,7883927,7818391,7752855,7687319,7621783,7556247,7490711,7425175,5917847,5852311,5786775,5721239,5655703,5590167,5524631,5459095,5393559,5328023,3820695,3755159,3689623,3624087,3558551,3493015,3427479,3361943,3296407,3230871,1723543,1658007,1592471,1526935,1461399,1395863,1330327,1264791,1199255,1133719,16403606,16338070,16272534,16206998,16141462,16075926,16010390,15944854,15879318,15813782,14306454,14240918,14175382,14109846,14044310,13978774,13913238,13847702,13782166,13716630,12209302,12143766,12078230,12012694,11947158,11881622,11816086,11750550,11685014,11619478,10112150,10046614,9981078,9915542,9850006,9784470,9718934,9653398,9587862,9522326,8014998,7949462,7883926,7818390,7752854,7687318,7621782,7556246,7490710,7425174,5917846,5852310,5786774,5721238,5655702,5590166,5524630,5459094,5393558,5328022,8014995,7949459,7883923,7818387,7752851,7687315,7621779,7556243,7490707,7425171,5917843,5852307,5786771,5721235,5655699,5590163,5524627,5459091,5393555,5328019,3820691,3755155,3689619,3624083,3558547,3493011,3427475,3361939,3296403,3230867,1723539,1658003,1592467,1526931,1461395,1395859,1330323,1264787,1199251,1133715,16403602,16338066,16272530,16206994,16141458,16075922,16010386,15944850,15879314,15813778,14306450,14240914,14175378,14109842,14044306,13978770,13913234,13847698,13782162,13716626,12209298,12143762,12078226,12012690,11947154,11881618,11816082,11750546,11685010,11619474,10112146,10046610,9981074,9915538,9850002,9784466,9718930,9653394,9587858,9522322,8014994,7949458,7883922,7818386,7687314,7621778,7556242,7490706,7425170,5917842,5852306,5786770,5721234,5655698,5590162,5524626,5459090,5393554,5094546,5029010,4963474,4897938,4832402,4766866,4701330,4635794,4570258,7425196,5917868,5852332,5786796,5721260,5655724,5590188,5524652,5459116,5393580,5328044,3820716,3755180,3689644,3624108,3558572,3493036,3427500,3361964,3296428,3230892,1723564,1658028,1592492,1526956,1461420,1395884,1330348,1264812,1199276,1133740,16403627,16338091,16272555,16207019,16141483,16075947,16010411,15944875,15879339,15813803,14306475,14240939,14175403,14109867,14044331,13978795,13913259,13847723,13782187,9363674]);

    function updatePortraitPreview(soldier, code = soldier?.portraitCode) {
        const image = $('staff-portrait-preview');
        const status = $('staff-portrait-preview-status');
        if (!image) return;
        // Story characters use the BC texture family for the same set/face pair.
        const actualCode = Number(code) >>> 0;
        const storyCode = ((actualCode & 0x00ff00ff) | 0xbc00) >>> 0;
        const resolved = PORTRAIT_ASSETS.has(actualCode) ? actualCode
            : soldier?.specialReadOnly && PORTRAIT_ASSETS.has(storyCode) ? storyCode : null;
        image.hidden = true;
        image.onload = () => { image.hidden = false; if (status) status.hidden = true; };
        image.onerror = () => {
            image.hidden = true;
            if (status) { status.textContent = 'Portrait unavailable'; status.hidden = false; }
        };
        if (status) { status.textContent = resolved === null ? 'Portrait unavailable' : 'Loading portrait…'; status.hidden = false; }
        if (resolved === null) { image.removeAttribute('src'); return; }
        image.alt = soldier ? `Portrait of ${soldier.name}` : 'Selected staff portrait';
        image.src = `media/staff-portraits/${resolved.toString(16).padStart(8, '0')}.png`;
        if (image.complete && image.naturalWidth) image.onload();
    }

    function populateStaff(soldier) {
        if (!soldier) return;
        selectedIndex = soldier.index;
        if ($('staff-snake-warning')) $('staff-snake-warning').hidden = !soldier.isSnake;
        if ($("staff-content")) $("staff-content").hidden = false;

        setText("staff-name", soldier.name);
        setValue("staff-name-input", soldier.name);

        setValue("staff-life", soldier.life.current);
        setValue("staff-psyche", soldier.psyche.current);
        setValue("staff-gmp", soldier.gmpBase);
        setValue("staff-morale", soldier.conditions.morale);

        const overall = combatOverall(soldier);
        setRangeAndNumber("combat", overall.base);
        setText("staff-combat-grade", overall.grade);

        for (const [key, prefix] of Object.entries(DEPARTMENT_MAP)) {
            setRangeAndNumber(prefix, soldier.departments[key]);
            setText(`staff-${prefix}-grade`, soldier.departmentGrades[key]);
        }

        setText("staff-gender", soldier.genderFlag);
        setText("staff-location", soldier.location.label);
        const portraitSelect = $("staff-portrait-choice");
        if (portraitSelect) {
            portraitSelect.replaceChildren();
            const choices = (global.VicbossPortraitOptions || []).filter(p => p.gender === soldier.genderFlag);
            if (!choices.some(p => p.code === soldier.portraitCode)) option(portraitSelect, soldier.portraitCode, "Current portrait — keep");
            for (const p of choices) option(portraitSelect, p.code, p.label.split(" — ")[0]);
            portraitSelect.value = String(soldier.portraitCode);
        }
        populateOrdinarySelect("staff-tag", soldier.tag, { 6: "POW", 7: "VOL", 8: "NML" });

        populateTitleSelect(soldier);
        if (soldier.specialReadOnly) {
            showReadOnly('staff-tag', soldier.tag.code, soldier.tag.label);
            showReadOnly('staff-title', soldier.title.code, soldier.title.label);
            showReadOnly('staff-portrait-choice', soldier.portraitCode, soldier.name + ' portrait');
        }
        updatePortraitPreview(soldier);
        populateDescriptionSelect(soldier);

        setText("staff-hostility", soldier.conditions.hostilityDisplayLevel);
        setText("staff-sick", soldier.conditions.sick);
        setText("staff-wounded", soldier.conditions.wounded);
        setText("staff-ptsd", soldier.conditions.ptsd);

        for (const [key, prefix] of Object.entries(COMBAT_MAP)) {
            setRangeAndNumber(prefix, soldier.combatAbilities[key]);
            setText(`staff-${prefix}-grade`, soldier.combatAbilityGrades[key]);
        }

        soldier.skills.forEach((skill, i) => {
            populateSkillSelect(`staff-skill-${i + 1}`, skill);
        });

        const overlay = $("staff-outerops-overlay");
        const panel = $("staff-content");
        if (overlay) {
            const box = overlay.querySelector("div");
            if (outerOpsLocked(soldier)) {
                overlay.style.display = "flex";
                if (box) {
                    box.innerHTML =
                        `CURRENTLY DISPATCHED ON OUTER OPS` +
                        `<small>Take this staff out of OUTER OPS in-game to enable editing.<br>You could also enable OUTER OPS editing in Advanced settings.</small>`;
                }
                if (panel) {
                    panel.scrollTop = 0;
                    panel.classList.add("pwse-outerops-locked");
                }
            } else {
                overlay.style.display = "none";
                if (panel) panel.classList.remove("pwse-outerops-locked");
            }
        }


        document.querySelectorAll(".staff-sidebar-staff").forEach(button => {
            button.classList.toggle(
                "selected",
                Number(button.dataset.index) === soldier.index
            );
        });

        setEditingState(soldier);
        if ($("staff-clear-statuses")) $("staff-clear-statuses").disabled = soldier.specialReadOnly || soldier.outerOps || !hasStatuses(soldier);
        refreshGmpTooltip();
        refreshAllDraftGrades();
        formDirty = false;
        updateExportButton();
    }

    function filteredStaff() {
        if (!save) return [];

        const nameQuery = ($("staff-sidebar-name")?.value || "").trim().toUpperCase();
        const team = $("staff-sidebar-team")?.value || "all";

        return (save.snake ? [save.snake, ...save.staff] : save.staff).filter(soldier => {
            if (soldier.specialReadOnly && !uniqueEditingEnabled()) return false;

            const matchesName =
                !nameQuery ||
                soldier.name.toUpperCase().includes(nameQuery) ||
                String(soldier.index).includes(nameQuery);

            const matchesTeam =
                team === "all" ||
                soldier.location.code === Number(team);

            return matchesName && matchesTeam;
        });
    }

    function readInteger(id, label) {
        const el = $(id);
        if (!el) throw Error(`${label} control is missing`);
        constrainNumber(el, true);
        const raw = String(el.value).trim();
        if (raw === "") throw Error(`${label} cannot be empty`);
        const n = Number(raw);
        if (!Number.isInteger(n)) throw Error(`${label} must be an integer`);
        return n;
    }

    function collectCurrentPatch() {
        restoreBlankName();
        const soldier = currentSoldier();
        const patch = {
            lifeCurrent: readInteger("staff-life", "LIFE"),
            psycheCurrent: readInteger("staff-psyche", "PSYCHE"),
            gmpBase: readInteger("staff-gmp", "GMP"),
            departments: {
                rd: readInteger("staff-rd-num", "R&D"),
                mess: readInteger("staff-messhall-num", "Mess Hall"),
                medical: readInteger("staff-medical-num", "Medical"),
                intel: readInteger("staff-intel-num", "Intel")
            },
            combatAbilities: {
                shoot: readInteger("staff-shoot-num", "Shoot"),
                reload: readInteger("staff-reload-num", "Reload"),
                throw: readInteger("staff-throw-num", "Throw"),
                place: readInteger("staff-place-num", "Place"),
                walkSpeed: readInteger("staff-walkspeed-num", "Walk Speed"),
                runSpeed: readInteger("staff-runspeed-num", "Run Speed"),
                fight: readInteger("staff-fight-num", "Fight"),
                defense: readInteger("staff-defense-num", "Defense")
            }
        };
        if (soldier.specialReadOnly) {
            if (soldier.skillsEditable) patch.skills = [1,2,3,4].map(n => readInteger(`staff-skill-${n}`, `Skill ${n}`));
            return patch;
        }
        return Object.assign(patch, {
            name: $("staff-name-input")?.value ?? soldier.name,
            portraitCode: readChoiceOrCurrent("staff-portrait-choice", "Portrait", soldier.portraitCode),
            quoteKey: $("staff-quote-choice")?.value || soldier.description.key,
            tagCode: readChoiceOrCurrent("staff-tag", "Tag", soldier.tag.code),
            titleCode: readChoiceOrCurrent("staff-title", "Title", soldier.title.code),
            morale: readInteger("staff-morale", "Morale"),
            skills: [1, 2, 3, 4].map(n => readInteger(`staff-skill-${n}`, `Skill ${n}`)),
        });
    }

    function currentSoldier() {
        if (!save || selectedIndex === null) return null;
        return save.getStaffByIndex(selectedIndex);
    }

    function flushCurrentForm() {
        if (!save || selectedIndex === null || !formDirty) return true;

        const soldier = currentSoldier();
        if (!soldier) {
            formDirty = false;
            return true;
        }

        if (outerOpsLocked(soldier) || (soldier.specialReadOnly && !uniqueEditingEnabled())) {
            formDirty = false;
            return true;
        }

        try {
            save.updateStaff(soldier.index, collectCurrentPatch());
            const updated = save.getStaffByIndex(soldier.index);
            setText("staff-location", updated.location.label);
            setText("staff-name", updated.name);
            setValue("staff-name-input", updated.name);
            document.querySelectorAll(".staff-sidebar-staff").forEach(button => {
                if (Number(button.dataset.index) === soldier.index) button.textContent = updated.name;
            });
            formDirty = false;
            updateExportButton();
            return true;
        } catch (err) {
            console.error(err);
            alert(err.message || String(err));
            return false;
        }
    }

    function selectStaff(index) {
        index = Number(index);
        if (!save || index === selectedIndex) return true;
        if (!flushCurrentForm()) return false;

        const soldier = save.getStaffByIndex(index);
        if (!soldier || (soldier.specialReadOnly && !uniqueEditingEnabled())) return false;
        populateStaff(soldier);
        return true;
    }

    function renderSidebar(options = {}) {
        const { flush = true } = options;
        const container = $("staff-sidebar-content");
        if (!container || !save) return;
        if (flush && !flushCurrentForm()) return;

        const list = filteredStaff();
        container.innerHTML = "";

        for (const soldier of list) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "staff-sidebar-staff";
            button.dataset.index = String(soldier.index);
            button.textContent = soldier.name;

            if (outerOpsLocked(soldier)) {
                button.title = "Currently dispatched on OUTER OPS";
            }

            // Store only the index. The current soldier object is fetched from
            // the mutable save model at click time, avoiding stale snapshots.
            button.addEventListener("click", () => selectStaff(Number(button.dataset.index)));
            container.appendChild(button);
        }

        if (!list.length) {
            selectedIndex = null;
            if ($("staff-content")) $("staff-content").hidden = true;
            const p = document.createElement("p");
            p.textContent = "No matching staff.";
            p.style.padding = "5px";
            container.appendChild(p);
            return;
        }

        const selectedStillVisible = list.some(s => s.index === selectedIndex);
        const indexToShow = selectedStillVisible ? selectedIndex : list[0].index;
        const selected = save.getStaffByIndex(indexToShow);
        if (selected) populateStaff(selected);
    }

    function markFormDirty() {
        if (suppressFormEvents || !save || selectedIndex === null) return;
        formDirty = true;
        changesSinceExport = true;
        updateExportButton();
    }

    function bindSimpleNumber(id) {
        $(id)?.addEventListener("input", markFormDirty);
    }

    function bindPair(prefix, kind) {
        const slider = $(`staff-${prefix}-slider`);
        const num = $(`staff-${prefix}-num`);

        const refresh = () => {
            if (kind === "department") {
                refreshDraftDepartmentGrade(prefix);
            } else if (kind === "combat") {
                refreshDraftCombatGrade(prefix);
                refreshDraftOverallCombat();
            }
        };

        slider?.addEventListener("input", () => {
            if (num) num.value = slider.value;
            refresh();
            markFormDirty();
        });

        num?.addEventListener("input", () => {
            if (slider && num.value !== "") slider.value = num.value;
            refresh();
            markFormDirty();
        });
    }

    function hasStatuses(soldier) {
        return ["sick", "wounded", "ptsd", "hostilityRaw"].some(k => soldier.conditions[k] > 0);
    }

    function refreshGmpTooltip() {
        const el = $("staff-gmp"), morale = $("staff-morale");
        if (!el || !morale) return;
        const base = Number(el.value), m = Number(morale.value);
        if (el.value === "" || morale.value === "" || !Number.isInteger(base) || base < 0 || base > 99999 || !Number.isInteger(m) || m < 0 || m > 999) {
            el.title = "Enter valid GMP and morale values to preview.";
            return;
        }
        const state = global.PWSEAbilityDisplay.calculate(base, m, currentSoldier()?.conditions);
        const adjusted = Math.min(99999, state.effective);
        el.title = "Base GMP: " + base.toLocaleString() + "\n" + (state.kind === "medical" ? "Illness-adjusted GMP: " : "Effective GMP: ") + adjusted.toLocaleString();
    }

    function maximiseSelectedStaff(kind) {
        const soldier = currentSoldier();
        if (!soldier || outerOpsLocked(soldier) || (soldier.specialReadOnly && !uniqueEditingEnabled())) return;
        if (soldier.specialReadOnly && kind === 'everything') return;
        if (!["abilities", "vitals", "everything"].includes(kind)) return;
        // Update the current draft, preserving unrelated pending edits.
        if (kind === "abilities" || kind === "everything") {
            for (const prefix of Object.values(DEPARTMENT_MAP)) setRangeAndNumber(prefix, 999);
            for (const prefix of Object.values(COMBAT_MAP)) setRangeAndNumber(prefix, 1250);
        }
        if (kind === "vitals" || kind === "everything") {
            setValue("staff-life", 9999);
            setValue("staff-psyche", 9999);
        }
        if (kind === "everything") {
            setValue("staff-gmp", 99999);
            setValue("staff-morale", 999);
        }
        refreshAllDraftGrades();
        refreshGmpTooltip();
        markFormDirty();
    }

    const numericLastValid = new WeakMap();

    function constrainNumber(el, finish = false) {
        if (!el || el.type !== "number" || el.disabled) return;
        const min = el.min === "" ? 0 : Number(el.min);
        const max = el.max === "" ? Number.MAX_SAFE_INTEGER : Number(el.max);
        const raw = el.value.trim();
        if (raw === "" && !finish) return;
        let value = raw === "" ? NaN : Number(raw);
        if (!Number.isFinite(value)) value = numericLastValid.get(el) ?? min;
        value = Math.min(max, Math.max(min, Math.trunc(value)));
        el.value = String(value);
        numericLastValid.set(el, value);
    }

    function bindNumericLimits() {
        for (const id of EDITABLE_IDS) {
            const el = $(id);
            if (!el || el.type !== "number") continue;
            el.step = "1";
            el.addEventListener("focus", () => {
                const n = Number(el.value);
                if (el.value !== "" && Number.isFinite(n)) numericLastValid.set(el, n);
            });
            el.addEventListener("beforeinput", event => {
                if (event.data && /[^0-9]/.test(event.data) && event.inputType === "insertText") event.preventDefault();
            });
            // Capture runs before existing listeners update sliders, grades and tooltips.
            el.addEventListener("input", () => constrainNumber(el), true);
            el.addEventListener("blur", () => {
                const before = el.value;
                constrainNumber(el, true);
                if (before !== el.value) el.dispatchEvent(new Event("input", { bubbles: true }));
            });
        }
    }

    // Keep the upload's name by record index, independently of session edits.
    function restoreBlankName() {
        const el = $("staff-name-input");
        const soldier = currentSoldier();
        if (!el || el.disabled || !soldier || soldier.specialReadOnly || outerOpsLocked(soldier) || el.value.trim() !== "") return;
        const original = uploadedNames.get(soldier.index) ?? soldier.name;
        el.value = original;
        setText("staff-name", original);
        document.querySelectorAll(".staff-sidebar-staff").forEach(button => {
            if (Number(button.dataset.index) === soldier.index) button.textContent = original;
        });
        if (original !== soldier.name) markFormDirty();
    }

    function bindEditors() {
        $("staff-name-input")?.addEventListener("blur", restoreBlankName);
        $("staff-name-input")?.addEventListener("input", () => {
            const el = $("staff-name-input");
            const start = el.selectionStart, end = el.selectionEnd;
            el.value = el.value.replace(/[a-z]/g, letter => letter.toUpperCase());
            if (start !== null) el.setSelectionRange(start, end);
            const soldier = currentSoldier();
            if (soldier) {
                const displayName = el.value.trim() || soldier.name;
                setText("staff-name", displayName);
                document.querySelectorAll(".staff-sidebar-staff").forEach(button => {
                    if (Number(button.dataset.index) === soldier.index) button.textContent = displayName;
                });
            }
            markFormDirty();
        });
        for (const [id, kind] of [["staff-max-abilities", "abilities"], ["staff-max-vitals", "vitals"], ["staff-max-everything", "everything"]]) {
            $(id)?.addEventListener("click", () => maximiseSelectedStaff(kind));
        }
        $("staff-quote-choice")?.addEventListener("change", () => {
            const soldier = currentSoldier();
            if (!soldier) return;
            const key = $("staff-quote-choice").value;
            setText("staff-desc", global.PWSEQuotes?.ordinary?.[key] || descriptionText(soldier));
            markFormDirty();
        });
        $("staff-portrait-choice")?.addEventListener("change", () => {
            updatePortraitPreview(currentSoldier(), $("staff-portrait-choice").value);
            markFormDirty();
        });
        for (const id of ["staff-tag", "staff-title"]) {
            $(id)?.addEventListener("change", markFormDirty);
        }
        $("staff-clear-statuses")?.addEventListener("click", () => {
            const soldier = currentSoldier();
            if (!soldier || soldier.specialReadOnly || soldier.outerOps || !hasStatuses(soldier)) return;
            try {
                // Commit pending form values and recovery together, or neither on failure.
                const patch = formDirty ? collectCurrentPatch() : {};
                save.updateStaff(soldier.index, { ...patch, clearStatuses: true });
                changesSinceExport = true;
                formDirty = false;
                const teamFilter = $("staff-sidebar-team");
                if (teamFilter && teamFilter.value !== "all") teamFilter.value = "1";
                selectedIndex = soldier.index;
                renderSidebar({ flush: false });
                updateExportButton();
            } catch (err) {
                console.error(err);
                alert(err.message || String(err));
            }
        });
        bindSimpleNumber("staff-gmp");
        $("staff-gmp")?.addEventListener("input", refreshGmpTooltip);
        bindSimpleNumber("staff-life");
        bindSimpleNumber("staff-psyche");

        $("staff-morale")?.addEventListener("input", () => {
            refreshAllDraftGrades();
            refreshGmpTooltip();
            markFormDirty();
        });

        for (const prefix of Object.values(DEPARTMENT_MAP)) bindPair(prefix, "department");
        for (const prefix of Object.values(COMBAT_MAP)) bindPair(prefix, "combat");

        for (let i = 1; i <= 4; i++) {
            $(`staff-skill-${i}`)?.addEventListener("change", event => {
                refreshSkillTooltip(event.currentTarget);
                markFormDirty();
            });
        }
    }

    function attachFilters() {
        $("staff-sidebar-name")?.addEventListener("input", () => renderSidebar({ flush: true }));
        $("staff-sidebar-team")?.addEventListener("change", () => renderSidebar({ flush: true }));
    }

    function updateExportButton() {
        const button = $("exportSave");
        const updateLastSaved = $("export-update-last-saved")?.checked ?? true;
        if (button) button.disabled = !save || (!save.isDirty && !formDirty && !updateLastSaved);
    }

    function downloadExport() {
        if (!save) throw Error("No save loaded");
        if (!flushCurrentForm()) throw Error("Fix the current staff values before exporting");
        global.VicbossRnDUI?.flushPendingEdits?.();
        global.VicbossRnDWeaponsUI?.flushPendingEdits?.();
        global.VicbossRnDOtherUI?.flushPendingEdits?.();
        global.VicbossRnDMechsUI?.flushPendingEdits?.();

        global.PWSEOverviewUI?.flushPendingEdits?.();
        global.PWSECodenameUI?.flushPendingEdits?.();
        const built = save.buildExport({
            updateLastSaved: $("export-update-last-saved")?.checked ?? true
        });
        const blob = new Blob([built.bytes], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = built.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        changesSinceExport = false;
        global.PWSEOverviewUI?.markExported?.();
        global.PWSECodenameUI?.markExported?.();
        global.VicbossInsigniasUI?.markExported?.();
        global.VicbossZekeUI?.markExported?.();
        global.VicbossRnDUI?.markExported?.();
        global.VicbossRnDWeaponsUI?.markExported?.();
        global.VicbossRnDOtherUI?.markExported?.();
        global.VicbossRnDMechsUI?.markExported?.();
        return built;
    }

    function attachExportButton() {
        const button = $("exportSave");
        if (!button || button.dataset.pwseBound === "1") return;
        button.dataset.pwseBound = "1";
        button.addEventListener("click", () => {
            try {
                downloadExport();
            } catch (err) {
                console.error(err);
                alert(err.message || String(err));
            }
        });
        $("export-update-last-saved")?.addEventListener("change", updateExportButton);
        updateExportButton();
    }

    function setSave(newSave) {
        save = newSave;
        save?.setUniqueStaffEditing(false);
        save?.setOuterOpsEditing(false);
        if ($('enable-outerops-editing')) $('enable-outerops-editing').checked = false;
        if ($('enable-unique-editing')) $('enable-unique-editing').checked = false;
        uploadedNames = new Map((save?.staff || []).map(soldier => [soldier.index, soldier.name]));
        selectedIndex = null;
        formDirty = false;
        changesSinceExport = false;

        const teamFilter = $("staff-sidebar-team");
        const nameFilter = $("staff-sidebar-name");
        if (teamFilter) teamFilter.value = "all";
        if (nameFilter) nameFilter.value = "";

        setControlLimits();
        attachExportButton();
        renderSidebar({ flush: false });
        updateExportButton();

        // Reset synchronously so a failed replacement has no queued scroll reset.
        for (const id of ["staff-sidebar-content", "staff-content"]) {
            const el = $(id);
            if (el) {
                el.scrollTop = 0;
                el.scrollLeft = 0;
            }
        }
    }

    const outerEditingCheckbox = $('enable-outerops-editing');
    if (outerEditingCheckbox) {
        outerEditingCheckbox.checked = false;
        outerEditingCheckbox.addEventListener('change', () => {
            if (!flushCurrentForm()) {
                outerEditingCheckbox.checked = Boolean(save?.outerOpsEditingEnabled);
                return;
            }
            global.VicbossRnDMechsUI?.flushPendingEdits?.();
            save?.setOuterOpsEditing(outerEditingCheckbox.checked);
            renderSidebar({ flush: false });
            global.VicbossRnDMechsUI?.render?.();
            global.VicbossZekeUI?.render?.();
        });
    }

    const uniqueEditingCheckbox = $('enable-unique-editing');
    if (uniqueEditingCheckbox) {
        uniqueEditingCheckbox.checked = false;
        uniqueEditingCheckbox.addEventListener('change', () => {
            const enabled = uniqueEditingCheckbox.checked;
            // Commit allowed pending fields before revoking permission/hiding staff.
            if (!flushCurrentForm()) {
                uniqueEditingCheckbox.checked = uniqueEditingEnabled();
                return;
            }
            save?.setUniqueStaffEditing(enabled);
            renderSidebar({ flush: false });
        });
    }

    ensureRuntimeStyles();
    installAbilityBars();
    attachFilters();
    setControlLimits();
    bindNumericLimits();
    bindEditors();
    attachExportButton();

    global.addEventListener('vicboss:other-changed', updateExportButton);
    global.addEventListener('vicboss:mechs-changed', updateExportButton);
    global.addEventListener('vicboss:items-changed', updateExportButton);
    global.addEventListener('vicboss:weapons-changed', updateExportButton);
    global.addEventListener('vicboss:profile-changed', updateExportButton);
    global.addEventListener('vicboss:codenames-changed', updateExportButton);
    global.addEventListener('vicboss:insignias-changed', updateExportButton);
    global.addEventListener('vicboss:zeke-changed', updateExportButton);

    function createCheckpoint() {
        const previous = { save, selectedIndex, uploadedNames, formDirty, changesSinceExport };
        return () => {
            ({ save, selectedIndex, uploadedNames, formDirty, changesSinceExport } = previous);
        };
    }

    global.PWSEStaffUI = Object.freeze({
        createCheckpoint,
        setSave,
        renderSidebar,
        downloadExport,
        flushPendingEdits: flushCurrentForm,
        hasUnexportedChanges() {
            return Boolean(save && (formDirty || changesSinceExport));
        },
        selectStaff(index) {
            return selectStaff(index);
        }
    });

})(window);
