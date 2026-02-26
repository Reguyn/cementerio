const { 
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const PREFIX = "!";
const dataPath = path.join(__dirname, "warnings.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


// ================== SISTEMA DE WARNS ==================

let warnings = {};

if (fs.existsSync(dataPath)) {
  warnings = JSON.parse(fs.readFileSync(dataPath, "utf8"));
}


// ================== READY ==================

client.once("ready", () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);

  client.user.setPresence({
    activities: [{
      name: "Benny's Custom | !panel",
      type: ActivityType.Playing
    }],
    status: "online"
  });
});


// ================== COMANDOS ==================

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ================= NORMAS =================
  if (message.content === "!normas") {

    const normas = `
NORMAS 📋

1.1 Prohibido actos ilegales en servicio.
1.2 Obligatorio licencia de conducir.
1.3 Siempre uniforme en servicio.
1.4 Prohibido uso personal del equipo.
1.5 Prohibido vehículo personal para trabajar.
1.6 No abandonar vehículos.
1.7 Obligatorio radio y Discord.
1.12 Trato respetuoso.
1.13 Prohibido tuneo gratuito.
1.14 Full tuning a precio de lista.
    `;

    const gifPath = path.join(__dirname, "tugif.gif");
    const attachment = new AttachmentBuilder(gifPath);

    await message.channel.send({
      content: "@everyone\n```" + normas + "```",
      allowedMentions: { parse: ["everyone"] }
    });

    await message.channel.send({ files: [attachment] });
  }


  // ================= PANEL =================
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🎟 Ticket Benny's")
      .setDescription("Selecciona una categoría para crear ticket");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("consultas")
        .setLabel("Consultas")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("❓"),

      new ButtonBuilder()
        .setCustomId("postularse")
        .setLabel("Postularse")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🔧"),

      new ButtonBuilder()
        .setCustomId("ausencias")
        .setLabel("Ausencias")
        .setStyle(ButtonStyle.Success)
        .setEmoji("⏳")
    );

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }


  // ================= WARN =================
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "warn") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ No tenés permisos.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("⚠️ Mencioná a un usuario.");

    args.shift();
    const reason = args.join(" ") || "Sin motivo";

    const guildId = message.guild.id;

    if (!warnings[guildId]) warnings[guildId] = {};
    if (!warnings[guildId][user.id]) warnings[guildId][user.id] = 0;

    warnings[guildId][user.id] += 1;

    fs.writeFileSync(dataPath, JSON.stringify(warnings, null, 2));

    const warnCount = warnings[guildId][user.id];

    await message.delete().catch(() => {});

    message.channel.send(`⚠️ WARN ${user} | ${reason} (${warnCount}/3)`);

    if (warnCount >= 3) {
      message.channel.send(`🚨 ${user} alcanzó 3/3 warns.`);
    }
  }
});


// ================= BOTONES =================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const guild = interaction.guild;
  const user = interaction.user;

  const CATEGORIA_ID = "1475645842580050040";
  const ROL_SOPORTE_1 = "1475646230259306516";
  const ROL_SOPORTE_2 = "1475652367012597831";


  // ===== CREAR TICKET =====
  if (["consultas", "postularse", "ausencias"].includes(interaction.customId)) {

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORIA_ID,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        },
        {
          id: ROL_SOPORTE_1,
          allow: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: ROL_SOPORTE_2,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const botonesTicket = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reclamar_ticket")
        .setLabel("Reclamar Ticket")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("cerrar_ticket")
        .setLabel("Cerrar Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `✅ Ticket creado: ${channel}`,
      ephemeral: true
    });

    await channel.send({
      content: `📌 Ticket abierto por ${user}\n<@&${ROL_SOPORTE_1}> <@&${ROL_SOPORTE_2}>`,
      components: [botonesTicket]
    });
  }


  // ===== RECLAMAR =====
  if (interaction.customId === "reclamar_ticket") {

    if (!interaction.member.roles.cache.has(ROL_SOPORTE_1) &&
        !interaction.member.roles.cache.has(ROL_SOPORTE_2)) {

      return interaction.reply({
        content: "❌ No tienes permiso.",
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `📌 ${interaction.user} ha reclamado este ticket.`
    });
  }


  // ===== CERRAR =====
  if (interaction.customId === "cerrar_ticket") {

    await interaction.reply({
      content: "🔒 Cerrando ticket en 5 segundos..."
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }

});

client.login(process.env.TOKEN);