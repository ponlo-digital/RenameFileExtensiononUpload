// == popup.js (for Option 2 - With Options Link) ==

// Get references to UI elements
const statusDiv = document.getElementById('status');
const siteUrlDiv = document.getElementById('siteUrl');
const enableButton = document.getElementById('enableButton');
const disableButton = document.getElementById('disableButton');
const optionsLink = document.getElementById('optionsLink'); // <-- Get link element

// Variables to store current tab info
let currentTab = null;
let currentOriginPattern = null;
let currentHostname = null;

// --- Initialization ---
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0 || !tabs[0].id || !tabs[0].url) {
        statusDiv.textContent = 'Cannot access current tab info.';
        console.error("Error querying tab:", chrome.runtime.lastError?.message || "No active tab found");
        return;
    }
    currentTab = tabs[0];
    try {
        const url = new URL(currentTab.url);
        if (!url.protocol.startsWith('http')) {
             statusDiv.textContent = 'Cannot activate on this page type.';
             siteUrlDiv.textContent = `(${url.protocol})`;
             optionsLink.classList.add('hidden'); // Hide options link on invalid pages
             return;
        }
        currentOriginPattern = url.origin + "/*";
        currentHostname = url.hostname;
        siteUrlDiv.textContent = currentHostname;
        checkPermission();
    } catch (e) {
        statusDiv.textContent = 'Invalid URL for this tab.';
        console.error("Error parsing URL:", e, "URL was:", currentTab.url);
         optionsLink.classList.add('hidden'); // Hide options link on invalid pages
    }
});

// --- Core Logic Functions ---
// (checkPermission, updateUI, injectContentScript, updateStoredSiteList functions remain the same as before)
function checkPermission() { // Keep this function
    if (!currentOriginPattern) return;
    chrome.permissions.contains({ origins: [currentOriginPattern] }, (granted) => {
        if (chrome.runtime.lastError) { statusDiv.textContent = 'Error checking permissions.'; console.error("Permission check error:", chrome.runtime.lastError.message); return; }
        updateUI(granted);
    });
}
function updateUI(isGranted) { // Keep this function
     if (!currentHostname) return;
    if (isGranted) {
        statusDiv.textContent = `✅ Enabled on:`; statusDiv.style.color = 'darkgreen';
        enableButton.classList.add('hidden'); disableButton.classList.remove('hidden');
        injectContentScript();
    } else {
        statusDiv.textContent = `❌ Disabled on:`; statusDiv.style.color = 'darkred';
        enableButton.classList.remove('hidden'); disableButton.classList.add('hidden');
    }
}
function injectContentScript() { // Keep this function
    if (!currentTab || !currentTab.id) { console.error("Cannot inject script, tab ID is missing."); return; }
    chrome.scripting.executeScript( { target: { tabId: currentTab.id }, files: ['content.js'], }, (results) => { if (chrome.runtime.lastError) { console.log(`Note: Error injecting script (may already be present): ${chrome.runtime.lastError.message}`); } else { console.log('Content script injected or already present on', currentHostname); } } );
}
function updateStoredSiteList(hostname, action = 'add') { // Keep this function
     if (!hostname) return;
     chrome.storage.sync.get({ allowedSites: [] }, (data) => { if (chrome.runtime.lastError) { console.error("Error getting stored sites:", chrome.runtime.lastError.message); return; } let currentSites = data.allowedSites || []; let changed = false; if (action === 'add' && !currentSites.includes(hostname)) { currentSites.push(hostname); changed = true; } else if (action === 'remove') { const initialLength = currentSites.length; currentSites = currentSites.filter(site => site !== hostname); if (currentSites.length !== initialLength) { changed = true; } } if (changed) { chrome.storage.sync.set({ allowedSites: currentSites }, () => { if (chrome.runtime.lastError) { console.error("Error saving updated site list:", chrome.runtime.lastError.message); } else { console.log(`Site list updated (${action}):`, currentSites); } }); } });
}


// --- Event Listeners ---
enableButton.addEventListener('click', () => { // Keep this listener
    if (!currentOriginPattern || !currentHostname) return;
    statusDiv.textContent = 'Requesting permission...'; enableButton.disabled = true;
    chrome.permissions.request({ origins: [currentOriginPattern] }, (granted) => {
        enableButton.disabled = false;
        if (chrome.runtime.lastError) { statusDiv.textContent = 'Error requesting permission.'; console.error("Permission request error:", chrome.runtime.lastError.message); return; }
        updateUI(granted);
        if (granted) { updateStoredSiteList(currentHostname, 'add'); }
    });
});

disableButton.addEventListener('click', () => { // Keep this listener
    if (!currentOriginPattern || !currentHostname) return;
    statusDiv.textContent = 'Removing permission...'; disableButton.disabled = true;
    chrome.permissions.remove({ origins: [currentOriginPattern] }, (removed) => {
        disableButton.disabled = false;
        if (chrome.runtime.lastError) { statusDiv.textContent = 'Error removing permission.'; console.error("Permission remove error:", chrome.runtime.lastError.message); return; }
        if (removed) { updateUI(false); updateStoredSiteList(currentHostname, 'remove'); }
        else { statusDiv.textContent = 'Could not remove permission.'; updateUI(true); }
    });
});

// === ADDED: Listener for the Options Link ===
optionsLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage(); // Standard way to open options
    } else {
      // Fallback for older environments (less likely needed for MV3)
      window.open(chrome.runtime.getURL('options.html'));
    }
    window.close(); // Close the popup after opening options
});
// ==========================================