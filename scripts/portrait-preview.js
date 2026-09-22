// THIS SCRIPT WAS CREATED USING GENERATIVE AI

/* Read-only local portrait previews. No save writes, uploads or persistent storage. */
(function (global) {
    "use strict";
    const $ = id => document.getElementById(id);
    let files = new Map(), soldier = null, generation = 0;
    const input = $("portrait-folder");
    const canvas = $("staff-portrait-preview");
    const status = $("staff-portrait-preview-status");
    function resourceId(name) {
        // Extraction filenames: archive hash, extraction index, exact resource hash.
        const match = /^([0-9a-f]{8})_(\d+)_([0-9a-f]{8})\.png$/i.exec(name);
        return match ? Number.parseInt(match[3], 16) : null;
    }
    function reset(message) {
        if (canvas) {
            canvas.hidden = true;
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        }
        if (status) status.textContent = message;
    }
    async function render() {
        const token = ++generation;
        if (!soldier) { reset("Select a staff member to view their portrait."); return; }
        const code = soldier.portraitCode >>> 0;
        const hex = "0x" + code.toString(16).toUpperCase().padStart(8, "0");
        if ($("staff-portrait-hex")) $("staff-portrait-hex").textContent = hex;
        if (!files.size) { reset("Load your local portrait_assets folder to view portraits."); return; }
        const file = files.get(code);
        if (file === null) { reset("Multiple files match " + hex + ". Choose a folder with one image per portrait value."); return; }
        if (!file) { reset("No matching image for " + hex + " in the selected folder."); return; }
        reset("Loading portrait…");
        const url = URL.createObjectURL(file);
        try {
            const image = new Image();
            await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
            if (token !== generation || !canvas) return;
            if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 2048 || image.naturalHeight > 2048) throw Error("Unsupported image size");
            const mask = document.createElement("canvas");
            mask.width = image.naturalWidth; mask.height = image.naturalHeight;
            const context = mask.getContext("2d", {willReadFrequently: true});
            context.drawImage(image, 0, 0);
            // These extracted textures carry portrait detail in alpha, not RGB.
            const pixels = context.getImageData(0, 0, mask.width, mask.height);
            let left = mask.width, top = mask.height, right = -1, bottom = -1;
            for (let y = 0; y < mask.height; y++) for (let x = 0; x < mask.width; x++) {
                const offset = (y * mask.width + x) * 4;
                pixels.data[offset] = 41; pixels.data[offset + 1] = 42; pixels.data[offset + 2] = 37;
                if (pixels.data[offset + 3] < 4) pixels.data[offset + 3] = 0;
                else { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
            }
            if (right < left) throw Error("Empty portrait mask");
            context.putImageData(pixels, 0, 0);
            const target = canvas.getContext("2d");
            target.fillStyle = "#c9c9b3"; target.fillRect(0, 0, canvas.width, canvas.height);
            const width = right - left + 1, height = bottom - top + 1;
            const scale = Math.min((canvas.width - 8) / width, (canvas.height - 8) / height);
            target.drawImage(mask, left, top, width, height, (canvas.width - width * scale) / 2, (canvas.height - height * scale) / 2, width * scale, height * scale);
            canvas.setAttribute("aria-label", "Portrait preview for " + soldier.name);
            canvas.hidden = false;
            status.textContent = "Local preview — " + file.name;
        } catch (error) {
            if (token === generation) reset("Unable to preview this image. Check that you selected the extracted portrait_assets folder.");
        } finally { URL.revokeObjectURL(url); }
    }
    input?.addEventListener("change", () => {
        const selected = Array.from(input.files || []);
        if (!selected.length) return;
        files = new Map();
        for (const file of selected) {
            const code = resourceId(file.name);
            if (code === null || file.size > 8 * 1024 * 1024) continue;
            files.set(code, files.has(code) ? null : file);
        }
        $("portrait-folder-status").textContent = files.size
            ? "Portrait folder loaded for this session. Images stay in your browser."
            : "No matching PNG filenames found. Select the extracted portrait_assets folder.";
        input.value = "";
        void render();
    });
    global.VicbossPortraitPreview = Object.freeze({
        setSoldier(value) { soldier = value; void render(); }
    });
})(window);
