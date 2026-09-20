// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
PWSE staff editor UI v1.2 — persistent editing + live morale-aware grades (helper hotfix)

Editable in this phase:
  - LIFE / PSYCHE current stored values (editor range 0–9999)
  - GMP (stored/base)
  - Morale
  - R&D / Mess Hall / Medical / Intel stored/base primary values
  - Eight stored/base combat ability values

Display model:
  - Number inputs/sliders = stored/base values written to the save
  - Grade labels = morale-adjusted effective values, matching the game's boost model
  - Hovering a grade/value exposes "Stored/base -> Morale-adjusted" details
  - data-base-value and data-morale-adjusted-value are attached for a future
    red-base/orange-morale-extension bar without changing the save model
  - Four skills remain editable
  - Title and English base quote preview are read-only

Deliberately still read-only:
  - Name
  - Gender, location, tag, portrait
  - Hostility, Sick, Wounded, PTSD
  - Overall Combat (derived)

OUTER OPS staff remain fully read-only.
*/
(function (global) {
    "use strict";

    let save = null;
    let selectedIndex = null;
    let formDirty = false;
    let suppressFormEvents = false;
    let changesSinceExport = false;

    const $ = id => document.getElementById(id);

    const EDITABLE_IDS = Object.freeze([
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

    // VERY STRONGLY SUPPORTED from controlled morale tests:
    // morale <= 500: no boost
    // morale > 500: floor(base * (2500 + morale - 500) / 2500)
    function moraleAdjusted(baseValue, morale) {
        const base = Number(baseValue);
        const m = Number(morale);
        if (!Number.isFinite(base) || !Number.isFinite(m)) return NaN;
        if (m <= 500) return Math.floor(base);
        return Math.floor(base * (2500 + (m - 500)) / 2500);
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

    function combatOverallFromValues(baseValues, morale) {
        if (!baseValues.length || baseValues.some(v => !Number.isFinite(v))) {
            return { base: null, effective: null, grade: "?" };
        }

        const effectiveValues = baseValues.map(
            v => Math.min(1250, moraleAdjusted(v, morale))
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
            soldier.conditions.morale
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

    function exposeMoraleDisplay(prefix, base, effective) {
        const gradeEl = $(`staff-${prefix}-grade`);
        const slider = $(`staff-${prefix}-slider`);
        const num = $(`staff-${prefix}-num`);

        const valid = Number.isFinite(base) && Number.isFinite(effective);
        const message = valid
            ? `Stored/base: ${base} | Morale-adjusted: ${effective}`
            : "Enter a valid stored/base value and morale.";

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
        const effective = moraleAdjusted(base, draftMorale());
        setText(`staff-${prefix}-grade`, departmentGrade(effective));
        exposeMoraleDisplay(prefix, base, effective);
    }

    function refreshDraftCombatGrade(prefix) {
        const base = draftNumber(`staff-${prefix}-num`);
        const effective = moraleAdjusted(base, draftMorale());
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
            : `Stored/base average: ${overall.base} | Morale-adjusted average: ${overall.effective} (derived)`;

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
    function populateTitleSelect(soldier) {
        showReadOnly('staff-title', soldier.title.code, soldier.title.label);
    }

    function skillLabel(code) {
        if (code === 0) return "0x00 — None";
        const label = global.PWSEStaffLookups?.SKILL_NAMES?.[code];
        return label
            ? `0x${code.toString(16).toUpperCase().padStart(2, "0")} — ${label}`
            : `0x${code.toString(16).toUpperCase().padStart(2, "0")} — Unknown`;
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

        option(el, 0, "0x00 — None");

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
        showReadOnly('staff-desc', soldier.description?.selectorHex || '',
            descriptionText(soldier), soldier.description?.note || '');
        setText('staff-desc-note', soldier.description?.note || '');
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

        setText("staff-name", soldier.name);

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
        setText("staff-portrait", soldier.portraitCode);
        setText("staff-tag", soldier.tag.label);

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
        const raw = String(el.value).trim();
        if (raw === "") throw Error(`${label} cannot be empty`);
        const n = Number(raw);
        if (!Number.isInteger(n)) throw Error(`${label} must be an integer`);
        return n;
    }

    function collectCurrentPatch() {
        return {
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

    function bindEditors() {
        bindSimpleNumber("staff-gmp");
        bindSimpleNumber("staff-life");
        bindSimpleNumber("staff-psyche");

        $("staff-morale")?.addEventListener("input", () => {
            refreshAllDraftGrades();
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
    attachFilters();
    bindEditors();
    setControlLimits();
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
