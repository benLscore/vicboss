// THIS SCRIPT WAS CREATED USING GENERATIVE AI

// Save loading: validate first, then replace the interface as one transaction.
(function (global) {
    'use strict';
    const $ = id => document.getElementById(id);
    const fileInput = $('saveFile');
    if (!fileInput) return;

    $('upload-link')?.addEventListener('click', event => {
        event.preventDefault();
        // Use the same picker and its existing confirmation/validation handlers,
        // including when the introductory upload container has been hidden.
        if (!fileInput.disabled) fileInput.click();
    });

    function report(message) {
        const el = $('error-message');
        if (!el) { if (message) global.alert(message); return; }
        el.textContent = message;
        el.hidden = !message;
        el.dataset.type = message ? 'error' : '';
    }

    // Retain original nodes, including their event listeners, rather than cloning
    // HTML. Live form values and private controller state both need restoring.
    function captureNode(node) {
        const children = Array.from(node.childNodes, captureNode);
        const attributes = node.nodeType === 1 ? Array.from(node.attributes, a => [a.name, a.value]) : null;
        const data = node.nodeType === 3 ? node.data : null;
        // File inputs cannot have their selected filename assigned by script.
        const value = /^(INPUT|SELECT|TEXTAREA)$/.test(node.nodeName) && node.type !== 'file' ? node.value : undefined;
        const checked = node.nodeName === 'INPUT' ? node.checked : undefined;
        const top = node.scrollTop, left = node.scrollLeft;
        return {node, restore() {
            const current = Array.from(node.childNodes);
            if (current.length !== children.length || children.some((child, i) => child.node !== current[i])) {
                node.replaceChildren(...children.map(child => child.node));
            }
            if (attributes) {
                const saved = new Map(attributes);
                for (const attr of Array.from(node.attributes)) {
                    if (!saved.has(attr.name)) node.removeAttribute(attr.name);
                }
                for (const [name, content] of attributes) {
                    if (node.getAttribute(name) !== content) node.setAttribute(name, content);
                }
            }
            if (data !== null) node.data = data;
            children.forEach(child => child.restore());
            if (value !== undefined) node.value = value;
            if (checked !== undefined) node.checked = checked;
            if (top !== undefined) node.scrollTop = top;
            if (left !== undefined) node.scrollLeft = left;
        }};
    }

    function installSave(nextSave) {
        const controllers = [global.PWSEOverviewUI, global.PWSEStaffUI,
            global.PWSECodenameUI, global.VicbossInsigniasUI, global.VicbossZekeUI, global.VicbossRnDUI, global.VicbossRnDWeaponsUI, global.VicbossRnDOtherUI, global.VicbossRnDMechsUI];
        const restoreControllers = controllers.map(controller => controller.createCheckpoint());
        const roots = [$('save-editor'), $('upload-container')].filter(Boolean).map(captureNode);
        const focus = document.activeElement;
        try {
            controllers.forEach(controller => controller.setSave(nextSave));
            global.VicbossSession.resetViewForNewSave();
            $('upload-container').style.display = 'none';
            $('upload-deco-image').style.display = 'none';
            $('save-editor').style.display = 'flex';
        } catch (error) {
            restoreControllers.forEach(restore => restore());
            roots.forEach(root => root.restore());
            if (focus?.isConnected) focus.focus({preventScroll: true});
            throw error;
        }
    }

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file || fileInput.disabled) return;
        if (!global.VicbossSession.confirmFileReplacement()) {
            fileInput.value = '';
            return;
        }
        fileInput.disabled = true;
        let stage = 'read';
        try {
            if (file.size !== global.PWSE.constants.FILE_SIZE) {
                stage = 'validate';
                throw Error(`Invalid save size: expected ${global.PWSE.constants.FILE_SIZE} bytes, got ${file.size}`);
            }
            const bytes = await file.arrayBuffer();
            stage = 'validate';
            const nextSave = global.PWSE.open(bytes, file.name);
            stage = 'interface';
            installSave(nextSave);
            report('');
        } catch (error) {
            console.error('Vicboss could not load the selected file', {
                filename: file.name, size: file.size, stage, error
            });
            report(stage === 'interface'
                ? 'The save was read, but the editor could not display it. Any previously loaded save and edits have been kept.'
                : stage === 'read'
                    ? 'The file could not be read. Please select it again.'
                    : 'Invalid save file. Please select a Peace Walker PC save.');
        } finally {
            fileInput.disabled = false;
            fileInput.value = '';
        }
    });
})(window);
