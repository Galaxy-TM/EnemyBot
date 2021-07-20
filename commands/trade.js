const Discord = require("discord.js");

/** 
 * @typedef {import("../index").InvLike} InvLike
 * @typedef Trade
 * @property { [string, string] } ids
 * @property { [string, string] } names
 * @property { [InvLike, InvLike] } offers
 * @property { [InvLike, InvLike] } invs
 * @property { Discord.TextChannel } channel
 */
/** @type { Trade[] } */
const trades = [];
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [type, item, count = 1], inventories, prefix, setInv) => {
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
                if (!(item in NAMES)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Item \`${item}\` does not exist.`)
                        .setColor("#E82727")
                    );
                    return;
                }
                count = Number(count);
                if (isNaN(count) || count < 0 || ((count % 1) !== 0)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`\`count\` has to be a positive integer number.`)
                        .setColor("#E82727")
                    );
                    return;
                }
                const index = trade.ids.indexOf(message.author.id);
                const inv = trade.invs[index];
                const offer = trade.offers[index];

                if (!(item in inv)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You don't have any ${NAMES[item][1]} ${EMOJIS[item]} in your inventory.`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (inv[item] < (offer[item] || 0) + count) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You don't have enough ${NAMES[item][1]} ${EMOJIS[item]} in your inventory.`)
                        .setColor("#E82727")
                    );
                    return;
                }

                if (item in offer) offer[item] += count;
                else offer[item] = count;

                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Trade offers`)
                    .addFields(...embedFields(trade))
                    .setColor("#E82727")
                );
            }
            break;
        }
        case "remove":
        case "r": {
            const trade = trades.find(t => t.channel === message.channel && t.ids.includes(message.author.id));
            if (trade) {
                if (!item) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Command syntax:`)
                        .setDescription(`\`\`\`${prefix}trade remove <item> [count]\`\`\``)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (!(item in NAMES)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Item \`${item}\` does not exist.`)
                        .setColor("#E82727")
                    );
                    return;
                }
                count = Number(count);
                if (isNaN(count) || count < 0 || ((count % 1) !== 0)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`\`count\` has to be a positive integer number.`)
                        .setColor("#E82727")
                    );
                    return;
                }

                const index = trade.ids.indexOf(message.author.id);
                const inv = trade.invs[index];
                const offer = trade.offers[index];

                if (!offer[item]) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You haven't offered any ${NAMES[item][1]}.`)
                        .setColor("#E82727")
                    );
                    return;
                }

                offer[item] = Math.max(0, offer[item] - count);

                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Trade offers`)
                    .addFields(...embedFields(trade))
                    .setColor("#E82727")
                );
            }
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
                    names: [from.tag, to.user.tag],
                    offers: [{}, {}],
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
/** @param {Trade} trade */
function embedFields(trade) {
    return [{
        name: `${trade.names[0]}'s Offer:     \u200c`,
        value: Object.entries(trade.offers[0]).filter(([_k, n]) => n).length
            ? Object.entries(trade.offers[0]).map(
                ([item, count]) => count ? `**${count}** ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}    \u200c` : false
            ).filter(n => n).join("\n")
            : "*[EMPTY]*",
        inline: true
    }, {
        name: "│",
        value: new Array(Math.max(Math.max(
            Object.keys(trade.offers[0]).length,
            Object.keys(trade.offers[1]).length
        ), 1)).fill("│").join("\n"),
        inline: true
    }, {
        name: `${trade.names[1]}'s Offer:`,
        value: Object.entries(trade.offers[1]).filter(([_k, n]) => n).length
            ? Object.entries(trade.offers[1]).map(
                ([item, count]) => count ? `**${count}** ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}` : false
            ).filter(n => n).join("\n")
            : "*[EMPTY]*",
        inline: true
    }];
}