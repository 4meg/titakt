let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: '**لقد قمت بالفعل بإنشاء تذكرة!**',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `**تـم انشـاء تـكت** <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('4b01cc')
          .setAuthor('Ticket - تـذكرة')
          .setDescription('**حـدد نـوع تـذكـرتـك** \n `ملاحضة :` اذا لم يتم تحديد نوع التكت سيتم حذفها بعد 10 دقائق')
          .setFooter('4meg.net', 'https://cdn.discordapp.com/attachments/883538556449062922/971259955443286016/21sd.png')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('قم باختيار')
            .addOptions([{
                label: 'طلب منتجات',
                value: 'طلب منتجات',
                emoji: '💰',
              },
              {
                label: 'تصاميم',
                value: 'تصاميم',
                emoji: '🎆',
              },
              {
                label: 'برمجيات',
                value: 'برمجيات',
                emoji: '⚙️',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 600000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket - تـذكرة')
                  .setDescription(`<@!${interaction.user.id}> تـم انـشاء تـذكرة ** ${i.values[0]} ** \n سيـتم اهمـال التـكت بـعد 48 سـاعة `)
                  .setFooter('4meg.net', 'https://cdn.discordapp.com/attachments/883538556449062922/971259955443286016/21sd.png')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('اغـلاق التـذكرة')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'طلب منتجات') {
              c.edit({
                parent: client.config.parentTransactions
              });
            };
            if (i.values[0] == 'تصاميم') {
              c.edit({
                parent: client.config.parentJeux
              });
            };
            if (i.values[0] == 'برمجيات') {
              c.edit({
                parent: client.config.parentAutres
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`**لـم يتـم اخـتيار فـئة.سـيتم إغـلاق الـتذكـرة **`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 60000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('إغلاق التذكرة')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('إلغاء الإغلاق')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'هل أنت متأكد أنك تريد إغلاق التذكرة؟        ',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 30000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `تم إغلاق التذكرة بحلول <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('4b01cc')
                .setAuthor('Ticket - تـذكرة')
                .setDescription('```مراقبة التذاكر```')
                .setFooter('4meg.net', 'https://cdn.discordapp.com/attachments/883538556449062922/971259955443286016/21sd.png')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('حذف التذكرة')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'إغلاق التذكرة الملغاة!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'إغلاق التذكرة الملغاة!',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'جاري حفظ الرسائل ...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('fr-FR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com/'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/918538284639076352/971274760019394580/342dfs.png')
              .setDescription(`📰 سجلات التذاكر \`${chan.id}\` انشأ من قبل <@!${chan.topic}> وحذفها <@!${interaction.user.id}>\n\nLogs: [**انقر هنا لمشاهدة السجلات**](${urlToPaste})`)
              .setColor('4b01cc')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://cdn.discordapp.com/attachments/918538284639076352/971274760019394580/342dfs.png')
              .setDescription(`📰 Logs de votre ticket \`${chan.id}\`: [**انقر هنا لمشاهدة السجلات**](${urlToPaste})`)
              .setColor('4b01cc')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('I can\'t dm him :(')});
            chan.send('جاري حذف القناة ...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
