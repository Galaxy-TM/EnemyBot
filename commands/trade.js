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
module.exports = (message, _c, [type], inventories, _p, setInv) => {
    switch (type) {
        case "add":
        case "a": {
            const trade = trades.find(t => t.ids.includes(message.author.id));
            if (trade) {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`found trade with you, current items are`)
                    .setDescription(JSON.stringify(trade))
                    .setColor("#E82727")
                );
                return;
            }
            break;
        }
        case undefined: {
            break;
        }
        default: {
            if (message.mentions.members.size) {
                if (trades.some(t => t.ids.includes(message.author.id))) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You already have a trade session!`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (trades.some(t => t.ids.includes(message.mentions.members.first().id))) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`<@!${message.mentions.members.first().id}> already has a trade session!`)
                        .setColor("#E82727")
                    );
                    return;
                }
                trades.push({
                    ids: [message.author.id, message.mentions.members.first().id],
                    items: [{}, {}],
                    channel: message.channel
                });
            }
            break;
        }
    }
}