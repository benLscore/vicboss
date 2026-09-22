// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/*
Vicboss session UI

Keeps browser-restored form/scroll state out of a fresh editor session and
protects staff changes that have not yet been exported.
*/
(function (global) {
    "use strict";

    const $ = id => document.getElementById(id);
    let replacementApproved = false;

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    function hasUnexportedChanges() {
        return Boolean(global.PWSEStaffUI?.hasUnexportedChanges?.());
    }

    function resetScrollPositions() {
        window.scrollTo(0, 0);

        for (const id of [
            "overview",
            "staff-sidebar-content",
            "staff-content",
            "codename"
        ]) {
            const el = $(id);
            if (el) {
                el.scrollTop = 0;
                el.scrollLeft = 0;
            }
        }
    }

    function resetRestorableControls() {
        const teamFilter = $("staff-sidebar-team");
        const nameFilter = $("staff-sidebar-name");
        const updateLastSaved = $("export-update-last-saved");

        if (teamFilter) teamFilter.value = "all";
        if (nameFilter) nameFilter.value = "";
        if (updateLastSaved) {
            updateLastSaved.checked = true;
            updateLastSaved.dispatchEvent(new Event("change"));
        }
    }

    function resetViewForNewSave() {
        resetRestorableControls();
        if (typeof global.show === "function") global.show("overview");
        requestAnimationFrame(resetScrollPositions);
    }

    function confirmFileReplacement() {
        if (!hasUnexportedChanges()) {
            replacementApproved = false;
            return true;
        }

        if (replacementApproved) {
            replacementApproved = false;
            return true;
        }

        return global.confirm(
            "Loading another save will discard changes that have not been exported. Continue?"
        );
    }

    const fileInput = $("saveFile");
    fileInput?.addEventListener("click", event => {
        replacementApproved = !hasUnexportedChanges() || global.confirm(
            "Loading another save will discard changes that have not been exported. Continue?"
        );

        if (!replacementApproved) event.preventDefault();
    });
    fileInput?.addEventListener("cancel", () => {
        replacementApproved = false;
    });

    global.addEventListener("beforeunload", event => {
        if (!hasUnexportedChanges()) return;
        event.preventDefault();
        // Required for Firefox and older Chromium. Browsers intentionally show
        // their own wording instead of a site-provided message.
        event.returnValue = "";
    });

    global.addEventListener("pageshow", () => {
        // Firefox may restore file controls and nested scrolling after reload.
        // Clear them after its restoration step has completed.
        requestAnimationFrame(() => {
            if (fileInput) fileInput.value = "";
            resetRestorableControls();
            resetScrollPositions();
        });
    });

    global.VicbossSession = Object.freeze({
        confirmFileReplacement,
        hasUnexportedChanges,
        resetScrollPositions,
        resetViewForNewSave
    });
})(window);
