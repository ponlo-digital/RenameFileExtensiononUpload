// content.js - Versión actualizada con mapeo personalizado de extensiones

// Función principal que intercepta eventos de selección de archivos
function setupFileInputListener() {
  // Recuperar la configuración actual
  chrome.storage.sync.get({
    extensionMap: {},
    renameAll: false,
    defaultExtension: 'txt'
  }, function(config) {
    console.log('[RenameExt] 🔧 Configuration loaded:', config);
    
    // Verificar si este sitio está habilitado
    const currentHost = window.location.hostname;
    chrome.storage.sync.get({
      enabledSites: []
    }, function(data) {
      if (data.enabledSites.includes(currentHost)) {
        console.log('[RenameExt] ✅ Enabled on this site:', currentHost);
        
        // Configurar el observador de cambios en el DOM para nuevos inputs
        setupMutationObserver(config);
        
        // Configurar listeners para inputs existentes
        setupExistingInputs(config);
      } else {
        console.log('[RenameExt] ❌ Not enabled on this site:', currentHost);
      }
    });
  });
}

// Función que procesa el cambio de archivo
function handleFileInputChange(event, config) {
  const input = event.target;
  if (input.files && input.files.length > 0) {
    // Crear un nuevo objeto DataTransfer para manipular los archivos
    const dataTransfer = new DataTransfer();
    let hasRenamed = false;
    
    // Procesar cada archivo
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      // Verificar si necesitamos renombrar este archivo
      const shouldRename = shouldRenameFile(file, config);
      if (shouldRename) {
        // Obtener la nueva extensión
        const newExtension = getTargetExtension(file, config);
        
        // Renombrar el archivo
        const renamedFile = renameFile(file, newExtension);
        
        // Añadir el archivo renombrado
        dataTransfer.items.add(renamedFile);
        hasRenamed = true;
        
        console.log(`[RenameExt] ✅ Renamed "${file.name}" to "${renamedFile.name}"`);
      } else {
        // Mantener el archivo original
        dataTransfer.items.add(file);
      }
    }
    
    // Reemplazar los archivos solo si hubo algún cambio
    if (hasRenamed) {
      // Desconectar temporalmente el listener para evitar bucles infinitos
      const originalListener = input._originalOnChangeListener || input.onchange;
      input.onchange = null;
      
      // Reemplazar los archivos
      input.files = dataTransfer.files;
      
      // Disparar evento de cambio si es necesario
      if (originalListener) {
        const newEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(newEvent);
      }
      
      // Restaurar el listener original
      setTimeout(() => {
        input.onchange = originalListener;
      }, 0);
    }
  }
}

// Determinar si un archivo debe ser renombrado
function shouldRenameFile(file, config) {
  if (config.renameAll) {
    return true;
  }
  
  // Obtener la extensión del archivo (sin el punto)
  const extension = file.name.split('.').pop().toLowerCase();
  
  // Verificar si esta extensión está en nuestro mapeo
  return Object.keys(config.extensionMap).includes(extension);
}

// Obtener la extensión de destino para un archivo
function getTargetExtension(file, config) {
  if (config.renameAll) {
    return config.defaultExtension;
  }
  
  // Obtener la extensión actual del archivo (sin el punto)
  const extension = file.name.split('.').pop().toLowerCase();
  
  // Obtener la extensión destino del mapeo
  return config.extensionMap[extension] || 'txt'; // Fallback a 'txt' si no hay mapeo
}

// Función para renombrar un archivo
function renameFile(file, newExtension) {
  // Obtener el nombre base sin extensión
  const nameParts = file.name.split('.');
  let baseName;
  
  if (nameParts.length > 1) {
    // Remover la extensión actual
    nameParts.pop();
    baseName = nameParts.join('.');
  } else {
    baseName = file.name;
  }
  
  // Crear el nuevo nombre
  const newName = `${baseName}.${newExtension}`;
  
  // Crear un nuevo objeto File con el nombre modificado
  return new File([file], newName, { type: file.type });
}

// Función para registrar los listeners en inputs existentes
function setupExistingInputs(config) {
  // Configurar listeners para inputs existentes
  const inputs = document.querySelectorAll('input[type="file"]');
  inputs.forEach(input => {
    // Guardar el listener original si existe
    if (input.onchange && !input._originalOnChangeListener) {
      input._originalOnChangeListener = input.onchange;
    }
    
    // Añadir nuestro listener
    input.addEventListener('change', (e) => handleFileInputChange(e, config));
  });
}

// Función para configurar el observador de cambios en el DOM
function setupMutationObserver(config) {
  // Observar cambios en el DOM para detectar nuevos inputs de archivo
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.tagName === 'INPUT' && node.type === 'file') {
            // Guardar el listener original si existe
            if (node.onchange && !node._originalOnChangeListener) {
              node._originalOnChangeListener = node.onchange;
            }
            
            // Añadir nuestro listener
            node.addEventListener('change', (e) => handleFileInputChange(e, config));
          } else if (node.querySelectorAll) {
            // Buscar inputs dentro del nodo añadido
            const inputs = node.querySelectorAll('input[type="file"]');
            inputs.forEach(input => {
              // Guardar el listener original si existe
              if (input.onchange && !input._originalOnChangeListener) {
                input._originalOnChangeListener = input.onchange;
              }
              
              // Añadir nuestro listener
              input.addEventListener('change', (e) => handleFileInputChange(e, config));
            });
          }
        }
      }
    });
  });
  
  // Iniciar observación del DOM completo
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupFileInputListener);
} else {
  // Si el DOM ya está cargado, configurar inmediatamente
  setupFileInputListener();
}