// ═══════════════════════════════════════════════════════════
// APPS SCRIPT — EVIDENCIA FOTOGRÁFICA (Google Drive)
// Guarda las fotos de cada registro de producción en Drive,
// organizadas en carpetas por Fecha / SKU-Lote.
//
// Devuelve el enlace de la carpeta para consultarlas.
// ═══════════════════════════════════════════════════════════

// ⚠️ PON AQUÍ EL ID DE UNA CARPETA DE TU DRIVE (opcional).
// Si lo dejas vacío, crea una carpeta llamada "Evidencia Produccion Sigma" en tu Drive.
const CARPETA_RAIZ_ID = '';

function doPost(e) {
  try {
    const p = e.parameter;

    if (p.modo === 'guardar_foto') {
      return guardarFoto(p);
    }

    return salida({ result: 'error', message: 'modo no reconocido' });
  } catch (err) {
    return salida({ result: 'error', message: err.toString() });
  }
}

function doGet(e) {
  // Permite consultar la carpeta de un registro
  if (e.parameter && e.parameter.modo === 'ver_fotos') {
    try {
      const carpeta = obtenerCarpetaRegistro(e.parameter.dia, e.parameter.sku, e.parameter.lote, false);
      if (!carpeta) {
        return salidaJSONP({ result: 'ok', fotos: [], carpeta: '' }, e);
      }
      const archivos = carpeta.getFiles();
      const fotos = [];
      while (archivos.hasNext()) {
        const f = archivos.next();
        fotos.push({
          nombre: f.getName(),
          url: 'https://drive.google.com/uc?id=' + f.getId(),
          ver: f.getUrl()
        });
      }
      return salidaJSONP({
        result: 'ok',
        fotos: fotos,
        carpeta: carpeta.getUrl()
      }, e);
    } catch (err) {
      return salidaJSONP({ result: 'error', message: err.toString() }, e);
    }
  }
  return ContentService.createTextOutput('Webhook de fotos activo');
}

// ── Guarda una foto en la carpeta del registro ──
function guardarFoto(p) {
  const carpeta = obtenerCarpetaRegistro(p.dia, p.sku, p.lote, true);

  // Decodificar la imagen (viene como data:image/jpeg;base64,....)
  let base64 = p.foto || '';
  const coma = base64.indexOf(',');
  if (coma !== -1) base64 = base64.substring(coma + 1);

  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, 'image/jpeg',
    'foto_' + (p.indice || '1') + '_' + Date.now() + '.jpg');

  const archivo = carpeta.createFile(blob);

  return salida({
    result: 'ok',
    archivo: archivo.getName(),
    carpeta: carpeta.getUrl()
  });
}

// ── Obtiene (o crea) la carpeta del registro: Raíz / Fecha / SKU-Lote ──
function obtenerCarpetaRegistro(dia, sku, lote, crear) {
  const raiz = obtenerCarpetaRaiz(crear);
  if (!raiz) return null;

  // Nivel 1: por fecha (dia viene como AAAA-MM-DD)
  const nombreFecha = (dia || 'sin-fecha').replace(/[^0-9-]/g, '');
  const carpetaFecha = obtenerSubcarpeta(raiz, nombreFecha, crear);
  if (!carpetaFecha) return null;

  // Nivel 2: por SKU + Lote
  const nombreReg = ('SKU-' + (sku || 's') + '_Lote-' + (lote || 's')).replace(/[^0-9A-Za-z_-]/g, '');
  return obtenerSubcarpeta(carpetaFecha, nombreReg, crear);
}

function obtenerCarpetaRaiz(crear) {
  if (CARPETA_RAIZ_ID) {
    try { return DriveApp.getFolderById(CARPETA_RAIZ_ID); } catch (e) {}
  }
  const nombre = 'Evidencia Produccion Sigma';
  const existentes = DriveApp.getFoldersByName(nombre);
  if (existentes.hasNext()) return existentes.next();
  if (crear) return DriveApp.createFolder(nombre);
  return null;
}

function obtenerSubcarpeta(padre, nombre, crear) {
  const existentes = padre.getFoldersByName(nombre);
  if (existentes.hasNext()) return existentes.next();
  if (crear) return padre.createFolder(nombre);
  return null;
}

// ── Respuestas ──
function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function salidaJSONP(obj, e) {
  const json = JSON.stringify(obj);
  if (e && e.parameter && e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
