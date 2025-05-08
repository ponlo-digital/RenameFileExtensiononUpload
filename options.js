// == options.js (Option 2 - Updated for Live Reload) ==

// Función para guardar la configuración
function saveOptions() {
    // Obtener el texto del área de mapeo de extensiones
    const mappingText = document.getElementById('extensionMapping').value.trim();
    
    // Analizar el texto para crear un objeto de mapeo
    const extensionMap = {};
    
    // Dividir por líneas o comas
    const entries = mappingText.split(/[\n,]+/).filter(entry => entry.trim() !== '');
    
    entries.forEach(entry => {
      // Formato esperado: "origen:destino" (por ejemplo "ejs:ejs.html")
      const parts = entry.split(':');
      if (parts.length === 2) {
        const source = parts[0].trim().replace(/^\./, ''); // Eliminar punto inicial si existe
        const target = parts[1].trim();
        if (source && target) {
          extensionMap[source] = target;
        }
      }
    });
    
    // Obtener el valor de "Rename ALL"
    const renameAll = document.getElementById('renameAll').checked;
    
    // Obtener el valor de la extensión predeterminada (para el modo "Rename ALL")
    const defaultExtension = document.getElementById('defaultExtension').value.trim() || 'txt';
    
    // Guardar en chrome.storage
    chrome.storage.sync.set({
      extensionMap: extensionMap,
      renameAll: renameAll,
      defaultExtension: defaultExtension
    }, function() {
      // Actualizar estado
      const status = document.getElementById('status');
      status.textContent = 'Settings saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 1500);
      
      // Recargar la lista de sitios habilitados
      loadEnabledSites();
    });
  }

// Función para cargar la configuración guardada
function loadOptions() {
    chrome.storage.sync.get({
      extensionMap: {},
      renameAll: false,
      defaultExtension: 'txt'
    }, function(items) {
      // Convertir el objeto de mapeo a texto
      const mappingText = Object.entries(items.extensionMap)
        .map(([source, target]) => `${source}:${target}`)
        .join('\n');
      
      document.getElementById('extensionMapping').value = mappingText;
      document.getElementById('renameAll').checked = items.renameAll;
      document.getElementById('defaultExtension').value = items.defaultExtension;
      
      // Cargar la lista de sitios habilitados
      loadEnabledSites();
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