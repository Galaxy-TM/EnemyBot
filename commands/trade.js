const Discord = require("discord.js");

/** 
 * @typedef Trade
 * @property { [string, string] } ids
 * @property { [import("../index").InvLike, import("../index").InvLike] } items
 * @property { Discord.TextChannel } channel
 */
/** @type { Trade[] } */
const trades = [];

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [type, item, count = 1], inventories, prefix, setInv) => {
    console.log(type);
    switch (type) {
        case "add":
        case "a": {
            const trade = trades.find(t => t.channel === message.channel && t.ids.includes(message.author.id));
            if (trade) {
                if (!item) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Command syntax:`)
                        .setDescription(`\`\`\`${prefix}trade add <item> [count]\`\`\``)
                        .setColor("#E82727")
                    );
                    return;
                }
            }
            count = Number(count);
            
            break;
        }
        case undefined: {
            break;
        }
        default: {
            if (message.mentions.members.size) {
                const to = message.mentions.members.first();
                const from = message.author;

                if (!(from.id in inventories)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You don't have an inventory 😕`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (to.id === from.id) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You can't trade with yourself!`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (trades.some(t => t.ids.includes(from.id))) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You already have a trade session!`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (!(to.id in inventories)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`<@!${to.id}> doesn't have an inventory 😕`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (trades.some(t => t.ids.includes(to.id))) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`<@!${to.id}> already has a trade session!`)
                        .setColor("#E82727")
                    );
                    return;
                }
                // Trade init
                trades.push({
                    ids: [from.id, to.id],
                    items: [{}, {}],
                    invs: [inventories[from.id], inventories[to.id]],
                    channel: message.channel
                });
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Trade initiated:`)
                    .setDescription(`<@!${from.id}> ⇄ <@!${to.id}>`)
                    .setColor("#E82727")
                );
            }
            break;
        }
    }
}