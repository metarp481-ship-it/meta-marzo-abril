// ─────────────────────────────────────────────
//  META RP — Bot Principal
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { init } = require("./ratingsManager");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    console.log(`[BOT] Comando cargado: /${command.data.name}`);
  } else {
    console.warn(`[BOT] ⚠️  El archivo ${file} no tiene "data" o "execute".`);
  }
}

client.once("ready", async () => {
  // Inicializar base de datos PostgreSQL
  try {
    await init();
    console.log("[BOT] ✅ Base de datos PostgreSQL conectada.");
  } catch (error) {
    console.error("[BOT] ❌ Error al conectar la base de datos:", error);
  }

  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║   META RP — Bot de Calificaciones  ║`);
  console.log(`╠════════════════════════════════════╣`);
  console.log(`║  ✅ Online como: ${client.user.tag.padEnd(18)}║`);
  console.log(`║  📡 Servidores : ${String(client.guilds.cache.size).padEnd(18)}║`);
  console.log(`╚════════════════════════════════════╝\n`);
  client.user.setActivity("Dev; @vladimirfernan.", { type: 3 });

  try {
    const commandsData = [...client.commands.values()].map((cmd) => cmd.data.toJSON());
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandsData }
    );
    console.log("[BOT] ✅ Comandos slash registrados automáticamente en Discord.");
  } catch (error) {
    console.error("[BOT] ❌ Error al registrar comandos:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.warn(`[BOT] Comando no encontrado: ${interaction.commandName}`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[BOT] Error al ejecutar /${interaction.commandName}:`, error);
    const errorMsg = {
      content: "❌ | Ocurrió un error al ejecutar este comando. Avisá al administrador.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg);
    } else {
      await interaction.reply(errorMsg);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
