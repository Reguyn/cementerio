const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    AttachmentBuilder
} = require('discord.js');




const path = require('path');

const TOKEN = "MTQ3NTY0MzI1MTY1MzQ3NjU1Mw.G4qYpg.xcFbS0XOEmDEdqMhJnZFJ3J6hLLRULBTzYIIgs";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ================= NORMAS =================
    if (message.content === "!normas") {

        const normas = `
                NORMAS 📋

1.1 Está completamente prohibido realizar actos ilegales en servicio.
1.2 Es obligatorio tener licencia de conducir.
1.3 Al estar en servicio siempre se debe llevar el uniforme.
1.4 Se prohíbe el uso del equipo para uso personal.
1.5 Está prohibido utilizar el vehículo personal para trabajar.
1.6 Está prohibido dejar abandonados los vehículos de trabajo.
1.7 Al entrar en servicio es obligatorio estar en radio y Discord.
1.8 /rp ENTRA EN SERVICIO.
1.9 /rp MECÁNICO EN CAMINO AL LLAMADO (#) A (#) KM
1.10 /rp INFORMAMOS QUE POR FALTA DE PERSONAL...
1.11 /rp EN CAMINO AL LLAMADO POLICIAL A (#) KM. ¿SERÍA SEGURA LA ZONA?
1.12 Trato respetuoso obligatorio.
1.13 Prohibido tuneo gratuito.
1.14 Full tuning a precio de lista.
1.15 No se puede robar material de trabajo.
        `;

        const gifPath = path.join(__dirname, 'tugif.gif');
        const attachment = new AttachmentBuilder(gifPath);

        await message.channel.send({
            content: "@everyone @here\n```" + normas + "```",
            allowedMentions: { parse: ["everyone"] }
        });

        await message.channel.send({ files: [attachment] });
    }

    // ================= PANEL =================
    if (message.content === "!panel") {
        const { EmbedBuilder } = require('discord.js');

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTitle("Ticket Benny's")
            .setDescription("Selecciona una categoría para crear ticket")
            .setThumbnail("https://cdn.discordapp.com/attachments/1229550964340428872/1475649057040109589/Diseno_sin_titulo.gif?ex=69a03b07&is=699ee987&hm=6c7f0e0735846b41edec9054fc180feb93ed1aee4d77f590ec49919c35067f94&");

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
});
// ================= BOTONES =================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const user = interaction.user;

    const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
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
                id: "1475646230259306516",
                allow: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: "1475652367012597831",
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    });

    await interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
    });

    if (interaction.customId === "postularse") {

        await channel.send(
            `<@&1475646230259306516> <@&1475652367012597831>\n\n` +
            `**FORMATO POSTULACION ${user} COPIAR Y PEGAR LO SIGUIENTE ---->**\n\n` +
            `• Nombre IC :\n` +
            `• Nombre Steam :\n` +
            `• Cuánto tiempo llevas jugando en zona sur:\n` +
            `• Edad OOC :\n` +
            `• Tenes experiencia como mecanico? en cual?\n` +
            `• ¿ Por qué querés formar parte de BENNYS CUSTOM? :\n` +
            `• Disponibilidad Horaria :`
        );

    } else if (interaction.customId === "ausencias") {

        await channel.send(
            `**PLANTILLA PARA AUSENCIAS ${user}**\n\n` +
            `Nombre STEAM:\n` +
            `Nombre IC:\n` +
            `Rango:\n` +
            `Ausente desde:\n` +
            `Ausente hasta:\n` +
            `Motivo:`
        );

    } else if (interaction.customId === "consultas") {

        await channel.send(
            `Hola ${user}, explica tu consulta y el equipo te responderá.`
        );
    }
});

client.login(TOKEN);