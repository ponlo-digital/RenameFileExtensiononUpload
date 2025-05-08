# Rename File Extension on Upload

**¿Los sitios web son quisquillosos con los tipos de archivos? ¡Contraataca con la extensión "Rename File Extension on Upload"!**

## ¿Qué hace esta extensión?

Esta extensión monitorea los eventos de selección de archivos en los sitios web que configures. Cuando seleccionas un archivo para subir, verifica si la extensión del archivo coincide con tu lista predefinida y crea una versión con una nueva extensión personalizada antes de que el navegador procese la carga, sin alterar tu archivo original.

## Características principales

- **Mapeo de extensiones personalizado**: Define qué extensiones quieres transformar y en qué se convertirán (por ejemplo, cambiar `.ejs` a `.ejs.html`)
- **Control por sitio**: La extensión solo funciona en los sitios web donde tú lo habilites explícitamente
- **Modo "Rename ALL"**: Una opción para cambiar cualquier archivo a una extensión predeterminada
- **Gestión de permisos**: Fácil visualización y revocación de acceso para sitios en la página de Opciones

## Cómo funciona la magia

1. **Crea tu lista de mapeo**: Dirígete a Opciones y dile al Renamer qué extensiones necesitan ser transformadas y en qué se convertirán (en formato `origen:destino`)
2. **Concede acceso al sitio**: Visita el sitio web quisquilloso, haz clic en el icono del Renamer y pulsa "Enable on This Site". Tú mandas - ¡solo funciona donde tú digas!
3. **Sube archivos normalmente**: Selecciona tu archivo .ts, .log u otro archivo basado en texto.
4. **Cambio instantáneo**: El Renamer cambia la extensión según tu configuración en un instante, localmente en tu navegador. ¡Tu archivo original no se toca!

## Guía de instalación manual

Esta guía asume que tienes el código de la extensión extraído en una carpeta en tu computadora.

### 1. Instalar la extensión desempaquetada

- Abre Google Chrome
- Navega a la página de Extensiones escribiendo `chrome://extensions` en tu barra de direcciones y presionando Enter
- Habilita el Modo Desarrollador: En la esquina superior derecha de la página de Extensiones, encuentra el interruptor "Modo desarrollador" y asegúrate de que esté ACTIVADO
- Carga la extensión:
  - Haz clic en el botón "Cargar descomprimida" que aparece (generalmente en la parte superior izquierda)
  - Se abrirá un diálogo de navegación de archivos. Navega hasta y selecciona la CARPETA que contiene los archivos de tu extensión (la que tiene `manifest.json`, `content.js`, `popup.html`, `options.html`, etc.). NO selecciones un archivo individual. Haz clic en "Seleccionar carpeta"
- Confirma la instalación: La extensión ("Rename File Extension on Upload") debería aparecer ahora en tu lista de extensiones. También deberías ver su icono en la barra de herramientas de Chrome (es posible que necesites hacer clic en el icono de rompecabezas 🧩 para encontrarlo y fijarlo). Si ves errores aquí, verifica tu `manifest.json`

### 2. Configurar ajustes iniciales

- Abre Opciones: Haz clic derecho en el icono de la extensión en tu barra de herramientas y selecciona "Opciones". Esto abrirá la página `options.html` en una nueva pestaña
- Configura el mapeo de extensiones: En el cuadro de texto, ingresa las extensiones de origen y destino en formato `origen:destino`, una por línea (por ejemplo, `ts:txt`, `js:txt`, `ejs:ejs.html`)
- Configura la "Extensión predeterminada": Ingresa la extensión que se usará con el modo "Rename ALL"
- Configura "Rename ALL" (Opcional): Si quieres que la extensión renombre cualquier archivo que procese a la extensión predeterminada (ignorando la lista anterior), marca la casilla junto a "Rename ALL selected files"
- Revisa la lista de sitios habilitados: Observa la sección "Sites Enabled via Popup". Estará vacía inicialmente
- Guarda: Haz clic en el botón "Save Settings"

### 3. Habilitar en un sitio web objetivo

- Navega: Ve al sitio web donde quieres probar el cambio de nombre de archivo (por ejemplo, `https://aistudio.google.com`)
- Haz clic en el icono: Haz clic en el icono de la extensión en la barra de herramientas de Chrome
- Verifica el popup: Debería aparecer una pequeña ventana emergente. Probablemente mostrará: ❌ Disabled on: aistudio.google.com
- Habilita: Haz clic en el botón verde "Enable on This Site" dentro del popup
- Concede permiso: Chrome probablemente mostrará un mensaje de permiso preguntando si quieres permitir que la extensión "Lea y cambie tus datos en aistudio.google.com". Haz clic en "Permitir"
- Verifica el popup: El popup debería actualizarse y ahora mostrar: ✅ Enabled on: aistudio.google.com. El botón "Disable on This Site" ahora debería ser visible

### 4. Usando la extensión

- Permanece en el sitio habilitado: Asegúrate de estar todavía en el sitio donde acabas de habilitar la extensión (por ejemplo, `aistudio.google.com`)
- Inicia la carga: Usa el mecanismo normal de carga de archivos del sitio web (haz clic en un botón "Subir archivo", arrastra y suelta, etc.)
- Selecciona archivo: Elige un archivo cuya extensión hayas añadido en las opciones (por ejemplo, `mycode.ts`) O cualquier archivo si marcaste "Rename ALL"
- Observa:
  - El archivo debería ser aceptado por el sitio web como si tuviera la extensión configurada
  - Comprueba la interfaz del sitio web – si muestra el nombre del archivo después de la selección, debería mostrar la versión con la nueva extensión

### 5. Verificar y solucionar problemas (si es necesario)

- Verifica la página de opciones: Actualiza la pestaña de Opciones de la extensión. El sitio web que habilitaste debería aparecer ahora en la lista "Sites Enabled via Popup"
- Verifica la consola: Si el cambio de nombre no funcionó:
  - En la página donde estás probando, presiona F12 para abrir las Herramientas de Desarrollador y ve a la pestaña "Consola"
  - Busca mensajes que comiencen con `[RenameExt]`. Deberías ver registros confirmando que la configuración se cargó y, crucialmente, un registro como `[RenameExt] ✅ Renaming "mycode.ts" to "mycode.ejs.html"` si funcionó
  - Busca mensajes de error en rojo (❌)
- Verifica la configuración: Asegúrate de que el mapeo de extensiones esté configurado correctamente y que hayas guardado la configuración
- Recarga todo: Si las cosas parecen estancadas, intenta eliminar la extensión (`chrome://extensions`), recargarla ("Cargar descomprimida"), actualizar forzosamente la página objetivo (Ctrl+Shift+R), y volver a habilitar a través del popup