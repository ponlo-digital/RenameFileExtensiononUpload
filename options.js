// == options.js (Option 2 - Updated for Live Reload) ==

function saveOptions() {
    // Only save extensions and the renameAll toggle
    const extensionsInput = document.getElementById('extensions').value;
    const forceRenameAll = document.getElementById('renameAllFiles').checked;

    const extensionsToSave = extensionsInput
        .split(/[\n,]+/)
        .map(ext => ext.trim().toLowerCase())
        .filter(ext => ext.length > 0);

    // Get current saved values to compare (optional, but good practice)
    chrome.storage.sync.get(['extensionsToRename', 'forceRenameAll'], (oldItems) => {
        const oldExtString = (oldItems.extensionsToRename || []).join(',');
        const newExtString = extensionsToSave.join(',');
        const oldForceRename = oldItems.forceRenameAll || false;

        // Only save and notify if something actually changed
        if (oldExtString !== newExtString || oldForceRename !== forceRenameAll) {
            chrome.storage.sync.set(
                {
                    extensionsToRename: extensionsToSave,
                    forceRenameAll: forceRenameAll
                },
                () => {
                    if (chrome.runtime.lastError) {
                        handleError(`Error saving settings: ${chrome.runtime.lastError.message}`);
                        return;
                    }
                    updateStatus('Options saved.', 'green', 1500);
                    // --- NEW: Send Message to Content Scripts ---
                    chrome.tabs.query({}, (tabs) => { // Query all tabs
                         if (chrome.runtime.lastError) {
                            console.warn("Could not query tabs to send update message:", chrome.runtime.lastError.message);
                            return;
                         }
                        tabs.forEach(tab => {
                            if (tab.id) {
                                chrome.tabs.sendMessage(tab.id, { type: "SETTINGS_UPDATED" }, (response) => {
                                     // Check response or lastError to see if the content script received it
                                    if (chrome.runtime.lastError) {
                                        // This often means the content script isn't injected in that tab (which is fine)
                                        // console.log(`Tab ${tab.id} did not receive message (likely inactive): ${chrome.runtime.lastError.message}`);
                                    } else if(response && response.status === "received") {
                                        // console.log(`Tab ${tab.id} confirmed receipt.`); // Optional log
                                    }
                                });
                            }
                        });
                        console.log("Sent SETTINGS_UPDATED message to potential content scripts.");
                    });
                    // -----------------------------------------
                }
            );
        } else {
            updateStatus('No changes detected.', 'gray', 1500);
        }
    });
}

// (restoreOptions, displayEnabledSites, handleRemoveSiteClick, updateStatus, handleError remain the same)
// --- Enabled Sites Display & Removal ---
function displayEnabledSites() { const listElement = document.getElementById('enabledSitesList'); listElement.innerHTML = '<li class="no-sites-enabled">Loading enabled sites...</li>'; chrome.permissions.getAll((permissions) => { if (chrome.runtime.lastError) { handleError("Error fetching permissions!"); listElement.innerHTML = '<li class="no-sites-enabled">Error loading sites.</li>'; return; } const origins = permissions.origins || []; const specificOrigins = origins.filter(origin => !origin.includes('<all_urls>')); listElement.innerHTML = ''; if (specificOrigins.length === 0) { listElement.innerHTML = '<li class="no-sites-enabled">No specific sites currently enabled via popup.</li>'; return; } specificOrigins.forEach(originPattern => { const listItem = document.createElement('li'); listItem.className = 'enabled-site-item'; const hostnameSpan = document.createElement('span'); hostnameSpan.className = 'site-hostname'; try { let displayHost = originPattern; if (originPattern.includes('://')) { displayHost = originPattern.split('://')[1].split('/')[0]; } hostnameSpan.textContent = displayHost; } catch(e) { hostnameSpan.textContent = originPattern; } const removeButton = document.createElement('button'); removeButton.className = 'remove-site-btn'; removeButton.textContent = 'X'; removeButton.title = `Revoke permission for ${originPattern}`; removeButton.dataset.origin = originPattern; listItem.appendChild(hostnameSpan); listItem.appendChild(removeButton); listElement.appendChild(listItem); }); }); }
function handleRemoveSiteClick(event) { if (event.target.classList.contains('remove-site-btn')) { const button = event.target; const originToRemove = button.dataset.origin; if (!originToRemove) { handleError("Could not identify site to remove."); return; } button.disabled = true; button.textContent = '...'; chrome.permissions.remove({ origins: [originToRemove] }, (removed) => { if (chrome.runtime.lastError) { handleError(`Error removing permission for ${originToRemove}: ${chrome.runtime.lastError.message}`); button.disabled = false; button.textContent = 'X'; return; } if (removed) { button.closest('.enabled-site-item')?.remove(); const listElement = document.getElementById('enabledSitesList'); if (!listElement.hasChildNodes()) { listElement.innerHTML = '<li class="no-sites-enabled">No specific sites currently enabled via popup.</li>'; } updateStatus(`Removed permission for ${originToRemove}`, 'green', 2000); } else { handleError(`Failed to remove permission for ${originToRemove}.`); button.disabled = false; button.textContent = 'X'; } }); } }
function updateStatus(message, color = 'green', duration = 1500) { const status = document.getElementById('status'); status.textContent = message; status.style.color = color; if (duration > 0) { setTimeout(() => { status.textContent = ''; }, duration); } }
function handleError(message) { console.error(message); updateStatus(message, 'red', 5000); }
function restoreOptions() { const dExt = []; chrome.storage.sync.get({ extensionsToRename: dExt, forceRenameAll: false }, (i) => { if (chrome.runtime.lastError) { handleError("Error loading settings!"); return; } document.getElementById('extensions').value = i.extensionsToRename.join(', '); document.getElementById('renameAllFiles').checked = i.forceRenameAll; }); }

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    displayEnabledSites();
    document.getElementById('enabledSitesList').addEventListener('click', handleRemoveSiteClick);
});
document.getElementById('save').addEventListener('click', saveOptions);