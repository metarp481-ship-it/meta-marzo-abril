// ─────────────────────────────────────────────
//  META RP — Gestor de Calificaciones (PostgreSQL)
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calificaciones (
      id SERIAL PRIMARY KEY,
      staff_id TEXT NOT NULL,
      usuario_id TEXT NOT NULL,
      estrellas INTEGER NOT NULL,
      motivo TEXT,
      fecha TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function addRating(staffId, estrellas, usuarioId, motivo) {
  await pool.query(
    `INSERT INTO calificaciones (staff_id, usuario_id, estrellas, motivo) VALUES ($1, $2, $3, $4)`,
    [staffId, usuarioId, estrellas, motivo]
  );
}

async function getStats(staffId) {
  const result = await pool.query(
    `SELECT COUNT(*) as total, AVG(estrellas) as promedio FROM calificaciones WHERE staff_id = $1`,
    [staffId]
  );
  const row = result.rows[0];
  return {
    total: parseInt(row.total),
    promedio: row.promedio ? parseFloat(row.promedio).toFixed(1) : "0.0",
  };
}

module.exports = { init, addRating, getStats };
