// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
Vicboss staff editor: persistent edits with live ability and GMP displays.

Editable: name, LIFE, PSYCHE, base GMP, morale, department/combat abilities,
ordinary tag/title, same-gender portrait/quote, and four skill slots.
Clear Statuses removes all conditions and transfers affected staff to Waiting Room.
Gender/location and derived overall Combat remain read-only.
Protected special staff are hidden; OUTER OPS staff cannot be edited.
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

        el.value = String(skill.code);
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
        const el = $("staff-quote-choice");
        if (el) {
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

    function setEditingState(soldier) {
        const panel = $("staff-content");
        if (!panel) return;

        panel.querySelectorAll("input, select, textarea, button").forEach(el => {
            el.disabled = true;
        });

        if (!soldier.outerOps && !soldier.specialReadOnly) {
            for (const id of EDITABLE_IDS) {
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

    function populateStaff(soldier) {
        if (!soldier) return;
        selectedIndex = soldier.index;
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
        populateOrdinarySelect("staff-tag", soldier.tag, {6: "POW", 7: "VOL", 8: "NML"});

        populateTitleSelect(soldier);
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
            if (soldier.outerOps) {
                overlay.style.display = "flex";
                if (box) {
                    box.innerHTML =
                        `CURRENTLY DISPATCHED ON OUTER OPS` +
                        `<small>This staff member is read-only until they return.</small>`;
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

        return save.staff.filter(soldier => {
            if (soldier.specialReadOnly) return false;

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
        return {
            name: $("staff-name-input")?.value ?? soldier.name,
            portraitCode: readChoiceOrCurrent("staff-portrait-choice", "Portrait", soldier.portraitCode),
            quoteKey: $("staff-quote-choice")?.value || soldier.description.key,
            tagCode: readChoiceOrCurrent("staff-tag", "Tag", soldier.tag.code),
            titleCode: readChoiceOrCurrent("staff-title", "Title", soldier.title.code),
            lifeCurrent: readInteger("staff-life", "LIFE"),
            psycheCurrent: readInteger("staff-psyche", "PSYCHE"),
            gmpBase: readInteger("staff-gmp", "GMP"),
            morale: readInteger("staff-morale", "Morale"),
            skills: [1, 2, 3, 4].map(n => readInteger(`staff-skill-${n}`, `Skill ${n}`)),
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

        if (soldier.outerOps || soldier.specialReadOnly) {
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
        if (!soldier || soldier.specialReadOnly) return false;
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

            if (soldier.outerOps) {
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
        if (!soldier || soldier.specialReadOnly || soldier.outerOps) return;
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
                if (before !== el.value) el.dispatchEvent(new Event("input", {bubbles: true}));
            });
        }
    }

    // Keep the upload's name by record index, independently of session edits.
    function restoreBlankName() {
        const el = $("staff-name-input");
        const soldier = currentSoldier();
        if (!el || el.disabled || !soldier || soldier.specialReadOnly || soldier.outerOps || el.value.trim() !== "") return;
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
        $("staff-portrait-choice")?.addEventListener("change", markFormDirty);
        for (const id of ["staff-tag", "staff-title"]) {
            $(id)?.addEventListener("change", markFormDirty);
        }
        $("staff-clear-statuses")?.addEventListener("click", () => {
            const soldier = currentSoldier();
            if (!soldier || soldier.specialReadOnly || soldier.outerOps || !hasStatuses(soldier)) return;
            try {
                // Commit pending form values and recovery together, or neither on failure.
                const patch = formDirty ? collectCurrentPatch() : {};
                save.updateStaff(soldier.index, {...patch, clearStatuses: true});
                changesSinceExport = true;
                formDirty = false;
                const teamFilter = $("staff-sidebar-team");
                if (teamFilter && teamFilter.value !== "all") teamFilter.value = "1";
                selectedIndex = soldier.index;
                renderSidebar({flush: false});
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
            $(`staff-skill-${i}`)?.addEventListener("change", markFormDirty);
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

        requestAnimationFrame(() => {
            for (const id of ["staff-sidebar-content", "staff-content"]) {
                const el = $(id);
                if (el) {
                    el.scrollTop = 0;
                    el.scrollLeft = 0;
                }
            }
        });
    }

    ensureRuntimeStyles();
    installAbilityBars();
    attachFilters();
    setControlLimits();
    bindNumericLimits();
    bindEditors();
    attachExportButton();

    global.PWSEStaffUI = Object.freeze({
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
