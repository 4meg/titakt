module.exports = {
  name: 'ready',
  async execute(client) {
    console.log('Ticket Bot ready!')
    console.log('Thank you very much for using Ticket Bot! Developed with the ❤️ by Sayrix');
    const oniChan = client.channels.cache.get(client.config.ticketChannel)

    function sendTicketMSG() {
      const embed = new client.discord.MessageEmbed()
        .setColor('4b01cc')
        .setAuthor('Ticket - تـذكرة', client.user.avatarURL())
        .setDescription(' **ممنوع إزعاج منشن (في حال لم يتم الرد عليك ، فلديك الحق بمنشن مرة ثانية 1️⃣** \n \n  ** يمنع طلب استرجاع للمنتج يرجى التاكد من المنتج قبل الــ$ـشَـٓراء 2️⃣** \n \n ** يتم اهمال التكـت بعد 48 سـاعة **3️⃣ ')
        .setImage("https://cdn.discordapp.com/attachments/923895779117105202/962730658915053578/1i.png")
        .setFooter(client.config.footerText, client.user.avatarURL())
      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('open-ticket')
          .setLabel('افتح تذكرة')
          .setEmoji('✉️')
          .setStyle('PRIMARY'),
        );

      oniChan.send({
        embeds: [embed],
        components: [row]
      })
    }

    const toDelete = 10000;

    async function fetchMore(channel, limit) {
      if (!channel) {
        throw new Error(`Expected channel, got ${typeof channel}.`);
      }
      if (limit <= 100) {
        return channel.messages.fetch({
          limit
        });
      }

      let collection = [];
      let lastId = null;
      let options = {};
      let remaining = limit;

      while (remaining > 0) {
        options.limit = remaining > 100 ? 100 : remaining;
        remaining = remaining > 100 ? remaining - 100 : 0;

        if (lastId) {
          options.before = lastId;
        }

        let messages = await channel.messages.fetch(options);

        if (!messages.last()) {
          break;
        }

        collection = collection.concat(messages);
        lastId = messages.last().id;
      }
      collection.remaining = remaining;

      return collection;
    }

    const list = await fetchMore(oniChan, toDelete);

    let i = 1;

    list.forEach(underList => {
      underList.forEach(msg => {
        i++;
        if (i < toDelete) {
          setTimeout(function () {
            msg.delete()
          }, 1000 * i)
        }
      })
    })

    setTimeout(() => {
      sendTicketMSG()
    }, i);
  },
};
