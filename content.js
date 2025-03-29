// == Rename Extension Upload - content.js v1.0 ==

// Guard against multiple executions in the same tab context
if (window.hasRenameExtensionRun_v8_7) {
    // Do nothing if already initialized
} else {
    window.hasRenameExtensionRun_v8_7 = true;

    // ==========================================================
    // === CONFIGURATION & GLOBALLY SCOPED VARIABLES ===
    // ==========================================================
    let config = {
        extensionsToRename: [],
        forceRenameAll: false
    };
    let isConfigLoaded = false;
    let configLoadPromise = null;

    let targetFileInput = null;
    let checkInterval = null;
    let periodicScanInterval = null; // Keep for fallback mechanism

    // ==========================================================
    // === CORE FUNCTIONS (Minimal Logging) ===
    // ==========================================================

    // --- Load Configuration ---
    function loadConfiguration() {
        if (!configLoadPromise) {
            configLoadPromise = new Promise((resolve, reject) => {
                const defaultExtensions = [];
                const defaultForceRenameAll = false;
                chrome.storage.sync.get(
                    { extensionsToRename: defaultExtensions, forceRenameAll: defaultForceRenameAll },
                    (items) => {
                        if (chrome.runtime.lastError) {
                            console.error("[RenameExt] ❌ Error loading config:", chrome.runtime.lastError.message || "Unknown Error");
                            isConfigLoaded = false;
                            reject(chrome.runtime.lastError); return;
                        }
                        config.extensionsToRename = items.extensionsToRename;
                        config.forceRenameAll = items.forceRenameAll;
                        isConfigLoaded = true;
                        // --- Relevant Log ---
                        console.log(`[RenameExt] Config updated - Rename: [${config.extensionsToRename.join(', ')}] | Rename All: ${config.forceRenameAll}`);
                        resolve();
                    }
                );
            });
        }
        return configLoadPromise;
    }

    // --- File Renaming Logic ---
    function renameFileIfNeeded(file) {
        if (!isConfigLoaded) return file; // Silently fail if config isn't ready

        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        let shouldRename = false;

        if (config.forceRenameAll) {
            if (lastDotIndex > 0) { shouldRename = true; } else { return file; }
        } else {
            if (!config.extensionsToRename || config.extensionsToRename.length === 0) { return file; }
            if (lastDotIndex <= 0) { return file; }
            const extension = originalName.substring(lastDotIndex + 1).toLowerCase();
            if (config.extensionsToRename.includes(extension)) { shouldRename = true; }
        }

        if (shouldRename) {
            const baseName = originalName.substring(0, lastDotIndex);
            const newName = `${baseName}.txt`;
            // --- Relevant Log ---
            console.log(`[RenameExt] ✅ Renamed "${originalName}" to "${newName}"`);
            try {
                return new File([file], newName, { type: 'text/plain', lastModified: file.lastModified });
            } catch (error) {
                console.error(`[RenameExt] ❌ Error creating new File object for ${newName}:`, error);
                return file;
            }
        }
        return file; // No rename needed
    }

    // --- File Processing (Async) ---
    async function processAndReplaceFiles(inputElement) {
        if (!isConfigLoaded) {
            try { await loadConfiguration(); }
            catch (error) { console.error("[RenameExt] ❌ Failed to load config before processing.", error); return false; }
        }

        const originalFiles = inputElement.files;
        if (!originalFiles || originalFiles.length === 0) { return false; }

        const modifiedFiles = []; let filesWereModified = false;
        Array.from(originalFiles).forEach(file => {
            const potentiallyModifiedFile = renameFileIfNeeded(file);
            modifiedFiles.push(potentiallyModifiedFile);
            if (potentiallyModifiedFile !== file) filesWereModified = true;
        });

        if (filesWereModified) {
            try {
                const dataTransfer = new DataTransfer();
                modifiedFiles.forEach(file => dataTransfer.items.add(file));
                inputElement.files = dataTransfer.files;
                // Dispatch events silently
                inputElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
                inputElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
                return true;
            } catch (error) {
                console.error("[RenameExt] ❌ Error during DataTransfer or assignment:", error);
                return false;
            }
        }
        return false; // No files were modified
    }

    // --- Event Handlers ---
    function handleChangeOrInput(event) {
         processAndReplaceFiles(event.target);
    }

    function checkTargetInputForFiles() {
        if (targetFileInput) {
            try {
                const currentLength = targetFileInput.files ? targetFileInput.files.length : 0;
                if (currentLength > 0 && !targetFileInput.dataset.renameProcessed) {
                     processAndReplaceFiles(targetFileInput).then(success => {
                          if (success) {
                             try {
                                targetFileInput.dataset.renameProcessed = 'true';
                                setTimeout(() => { if(targetFileInput) { try { delete targetFileInput.dataset.renameProcessed; } catch(e){} } }, 1500);
                             } catch(e) { /* Silently ignore dataset errors if element disappears */ }
                          }
                     });
                }
                 else if (currentLength === 0 && targetFileInput.dataset.renameProcessed) {
                      try { delete targetFileInput.dataset.renameProcessed; } catch(e){}
                 }
             } catch (e) { /* Silently ignore errors accessing target if removed */ targetFileInput = null; }
        } else { if (checkInterval) { clearInterval(checkInterval); checkInterval = null; } }
    }

    // --- DOM Interaction Setup ---
    function setupInput(input) {
        if (input.dataset.renameListenerAttached === 'true') { return; }
        input.addEventListener('change', handleChangeOrInput, true);
        input.addEventListener('input', handleChangeOrInput, true);
        input.dataset.renameListenerAttached = 'true';
        if (input.style?.display === 'none') {
            if (targetFileInput && targetFileInput !== input) { if(checkInterval) clearInterval(checkInterval); }
            targetFileInput = input;
            checkInterval = setInterval(checkTargetInputForFiles, 250); // Keep polling faster
            input.dataset.renamePollingTarget = 'true';
        }
    }

    const mutationCallback = (mutationsList) => {
        for (const mutation of mutationsList) { if (mutation.type === 'childList') { mutation.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE) { if (node.matches && node.matches('input[type="file"]')) { setupInput(node); } else if (node.querySelectorAll) { const nestedInputs = node.querySelectorAll('input[type="file"]'); if (nestedInputs.length > 0) { nestedInputs.forEach(setupInput); } } } }); } }
    };

    // ============================================
    // === ACTIVATION & MESSAGE LISTENER ===
    // ============================================
    function activateExtensionFeatures() {
        try { document.querySelectorAll('input[type="file"]').forEach(setupInput); }
        catch(e) { console.error("[RenameExt] Error during initial DOM scan:", e); }
        const observer = new MutationObserver(mutationCallback);
        observer.observe(document.body, { childList: true, subtree: true });
        if (periodicScanInterval) clearInterval(periodicScanInterval);
        periodicScanInterval = setInterval(() => { try { document.querySelectorAll('input[type="file"]').forEach(setupInput); } catch (e) { /* Silently ignore periodic scan errors */ } }, 1500);
    }

    // --- Message Listener ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "SETTINGS_UPDATED") {
            configLoadPromise = null; // Force reload
            isConfigLoaded = false;
            loadConfiguration()
                .then(() => { sendResponse({ status: "reloaded" }); })
                .catch(error => { sendResponse({ status: "error", message: error?.message }); });
            return true; // Indicate async response
        }
        return false;
    });
    // --- Main Execution Flow ---
    loadConfiguration()
        .then(() => {
            activateExtensionFeatures();
        })
        .catch(error => {
            console.error("[RenameExt] ❌ Features NOT activated due to config load failure.");
            if(periodicScanInterval) clearInterval(periodicScanInterval);
            if(checkInterval) clearInterval(checkInterval);
        });


} // End of script guard