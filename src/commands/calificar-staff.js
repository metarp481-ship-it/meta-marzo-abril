// ─────────────────────────────────────────────
//  META RP — Comando /calificar-staff
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { ROL_STAFF_ID, CANAL_CALIFICACIONES_ID, CANAL_REGISTRO_ID } = require("../config");
const { addRating, getStats } = require("../ratingsManager");

function buildStars(n) {
  return "⭐".repeat(n);
}

function buildFecha() {
  return new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calificar-staff")
    .setDescription("Califica a un STAFF por su atención.")
    .addUserOption((o) =>
      o.setName("staff").setDescription("Miembro del staff a calificar.").setRequired(true)
    )
    .addIntegerOption((o) =>
      o.setName("estrellas")
        .setDescription("¿Cuántas estrellas le das? (1 a 5)")
        .setRequired(true)
        .addChoices(
          { name: "⭐", value: 1 },
          { name: "⭐⭐", value: 2 },
          { name: "⭐⭐⭐", value: 3 },
          { name: "⭐⭐⭐⭐", value: 4 },
          { name: "⭐⭐⭐⭐⭐", value: 5 }
        )
    )
    .addStringOption((o) =>
      o.setName("opinion_personal")
        .setDescription("Escribe tu opinión sobre el staff")
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    const staffMember = interaction.options.getMember("staff");
    const estrellas   = interaction.options.getInteger("estrellas");
    const opinion     = interaction.options.getString("opinion_personal");
    const autor       = interaction.member;

    if (interaction.channelId !== CANAL_CALIFICACIONES_ID) {
      return interaction.reply({
        content: `❌ | Solo podés usar este comando en <#${CANAL_CALIFICACIONES_ID}>.`,
        ephemeral: true,
      });
    }

    if (!staffMember || !staffMember.roles.cache.has(ROL_STAFF_ID)) {
      return interaction.reply({
        content: "😡 | Ese no es STAFF, bobo!",
        ephemeral: true,
      });
    }

    if (staffMember.id === autor.id) {
      return interaction.reply({
        content: "🚫 | No puedes calificarte a ti mismo.",
        ephemeral: true,
      });
    }

    await addRating(staffMember.id, estrellas, autor.id, opinion);
    const stats  = await getStats(staffMember.id);
    const hora   = buildFecha();
    const avatar = autor.user.displayAvatarURL({ size: 256 });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("✅ | Calificación Staff — Registrada")
      .setDescription("Tu opinion nos ayuda a mejorar cada dia, muchas gracias.")
      .setThumbnail(avatar)
      .addFields(
        { name: "👤 | Usuario",          value: `${autor}`,            inline: true },
        { name: "🔵 | Staff calificado", value: `${staffMember}`,      inline: true },
        { name: "⭐ | Estrellas",         value: buildStars(estrellas), inline: true },
        { name: "🗣️ | Opinión personal",  value: opinion,               inline: false },
        { name: "✅ | Estadísticas",      value: `${stats.total} calificaciones · Promedio: ${stats.promedio}/5`, inline: false }
      )
      .setFooter({ text: `© Todos los derechos reservados 2026, META RP | ER:LC • hoy a las ${hora}` });

    const canalRegistro = interaction.guild.channels.cache.get(CANAL_REGISTRO_ID);

    if (!canalRegistro) {
      return interaction.reply({
        content: "❌ | Error: canal de registro no encontrado. Contactá al administrador.",
        ephemeral: true,
      });
    }

    await canalRegistro.send({ content: `${staffMember}`, embeds: [embed] });

    return interaction.reply({
      content: "✅ | Tu calificación ha sido enviada correctamente.",
      ephemeral: true,
    });
  },
};
