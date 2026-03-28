// ─────────────────────────────────────────────
//  META RP — Deploy de Comandos Slash
//  Ejecutar con: node src/deploy-commands.js
//  Desarrollado por Vladimir
// ─────────────────────────────────────────────

require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
    console.log(`[DEPLOY] Comando cargado: /${command.data.name}`);
  }
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`\n[DEPLOY] Registrando ${commands.length} comando(s) en Discord...`);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("[DEPLOY] ✅ Comandos registrados correctamente en el servidor!");
  } catch (error) {
    console.error("[DEPLOY] ❌ Error al registrar los comandos:", error);
  }
})();
