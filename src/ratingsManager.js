// ─────────────────────────────────────────────
//  META RP — Gestor de Calificaciones (en memoria)
//  Para persistencia real, integrar una base de datos.
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────

// Estructura: Map<staffId, { total: number, suma: number, calificaciones: Array }>
const ratings = new Map();

/**
 * Registra una nueva calificación para un miembro del staff.
 * @param {string} staffId - ID del miembro calificado
 * @param {number} estrellas - Cantidad de estrellas (1-5)
 * @param {string} usuarioId - ID del usuario que calificó
 * @param {string} motivo - Motivo/opinión de la calificación
 */
function addRating(staffId, estrellas, usuarioId, motivo) {
  if (!ratings.has(staffId)) {
    ratings.set(staffId, { total: 0, suma: 0, calificaciones: [] });
  }

  const data = ratings.get(staffId);
  data.total += 1;
  data.suma += estrellas;
  data.calificaciones.push({
    usuarioId,
    estrellas,
    motivo,
    fecha: new Date().toISOString(),
  });
}

/**
 * Obtiene las estadísticas de un miembro del staff.
 * @param {string} staffId - ID del miembro
 * @returns {{ total: number, promedio: string }} Estadísticas del staff
 */
function getStats(staffId) {
  if (!ratings.has(staffId)) {
    return { total: 0, promedio: "0.0" };
  }

  const data = ratings.get(staffId);
  const promedio = data.total > 0
    ? (data.suma / data.total).toFixed(1)
    : "0.0";

  return {
    total: data.total,
    promedio,
  };
}

module.exports = { addRating, getStats };
