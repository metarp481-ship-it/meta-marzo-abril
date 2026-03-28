// ─────────────────────────────────────────────
//  META RP — Comando /calificar-staff
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const { ROL_STAFF_ID, CANAL_CALIFICACIONES_ID, CANAL_REGISTRO_ID, COLOR_EMBED, FOOTER_TEXT } = require("../config");
const { addRating, getStats } = require("../ratingsManager");

// Convierte número de estrellas en emojis ⭐
function buildStars(n) {
  return "⭐".repeat(n) + (n < 5 ? "☆".repeat(5 - n) : "");
}

// Fecha formateada estilo argentino
function buildFecha() {
  return new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calificar-staff")
    .setDescription("⭐ Califica a un miembro del staff de META RP")
    .addUserOption((option) =>
      option
        .setName("staff")
        .setDescription("Selecciona al miembro del staff a calificar")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("estrellas")
        .setDescription("¿Cuántas estrellas le das? (1 a 5)")
        .setRequired(true)
        .addChoices(
          { name: "⭐ — 1 estrella", value: 1 },
          { name: "⭐⭐ — 2 estrellas", value: 2 },
          { name: "⭐⭐⭐ — 3 estrellas", value: 3 },
          { name: "⭐⭐⭐⭐ — 4 estrellas", value: 4 },
          { name: "⭐⭐⭐⭐⭐ — 5 estrellas", value: 5 }
        )
    )
    .addStringOption((option) =>
      option
        .setName("motivo")
        .setDescription("Escribe tu opinión sobre el staff")
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    const staffMember = interaction.options.getMember("staff");
    const estrellas = interaction.options.getInteger("estrellas");
    const motivo = interaction.options.getString("motivo");
    const autor = interaction.member;

    // ── 1. Verificar que el usuario seleccionado tenga el rol de Staff ──
    if (!staffMember || !staffMember.roles.cache.has(ROL_STAFF_ID)) {
      return interaction.reply({
        content: "😡 | Ese no es STAFF, bobo!",
        ephemeral: true,
      });
    }

    // ── 2. Evitar que alguien se califique a sí mismo ──
    if (staffMember.id === autor.id) {
      return interaction.reply({
        content: "🚫 | No puedes calificarte a ti mismo.",
        ephemeral: true,
      });
    }

    // ── 3. Registrar la calificación ──
    addRating(staffMember.id, estrellas, autor.id, motivo);
    const stats = getStats(staffMember.id);
    const fecha = buildFecha();
    const starsDisplay = buildStars(estrellas);

    // ── 4. Construir el embed ──
    const embed = new EmbedBuilder()
      .setColor(COLOR_EMBED)
      .setTitle("✅ | Calificación Staff — Registrada")
      .setDescription("Gracias por tu calificación.")
      .addFields(
        {
          name: "🪪 | Usuario",
          value: `${autor}`,
          inline: false,
        },
        {
          name: "🔵 | Staff calificado",
          value: `${staffMember}`,
          inline: false,
        },
        {
          name: "🏅 | Estrellas",
          value: starsDisplay,
          inline: false,
        },
        {
          name: "🗣️ | Opinión personal",
          value: motivo,
          inline: false,
        },
        {
          name: "✅ | Estadísticas",
          value: `${stats.total} calificaciones · Promedio: ${stats.promedio}/5`,
          inline: false,
        }
      )
      .setFooter({
        text: `${FOOTER_TEXT} | ${fecha}`,
      });

    // ── 5. Obtener los canales ──
    const canalPublico = interaction.guild.channels.cache.get(CANAL_CALIFICACIONES_ID);
    const canalRegistro = interaction.guild.channels.cache.get(CANAL_REGISTRO_ID);

    if (!canalPublico || !canalRegistro) {
      console.error("[ERROR] No se encontraron los canales configurados.");
      return interaction.reply({
        content: "❌ | Error interno: no se encontraron los canales de calificación. Contactá al administrador.",
        ephemeral: true,
      });
    }

    // ── 6. Enviar al canal público con mención al staff ──
    await canalPublico.send({
      content: `📋 | Nueva calificación para ${staffMember}`,
      embeds: [embed],
    });

    // ── 7. Enviar copia al canal de registro interno ──
    const embedRegistro = EmbedBuilder.from(embed)
      .setTitle("📁 | Registro de Calificación")
      .setColor(0x5865f2);

    await canalRegistro.send({
      content: `🗂️ | Registro interno — Staff: ${staffMember} | Por: ${autor}`,
      embeds: [embedRegistro],
    });

    // ── 8. Confirmar al usuario que ejecutó el comando ──
    return interaction.reply({
      content: `✅ | Tu calificación para ${staffMember} fue enviada correctamente!`,
      ephemeral: true,
    });
  },
};
