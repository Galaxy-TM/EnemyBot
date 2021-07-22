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
const UNTRADEABLE = [...require("../lib/trophies.json")];


/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [type, item, count = 1], inventories, prefix, setInv) => {
    switch (type) {
        case "add":
        case "a": {
            const trade = trades.find(t => t.channel === message.channel && t.ids.includes(message.author.id));
            if (!trade) {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`You don't have a trade right now!`)
                    .setDescription(`Use \`${prefix}trade <@user>\` to initiate a trade!`)
                    .setColor("#E82727")
                );
                return;
            }

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
            if (item in UNTRADEABLE) {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`${NAMES[item][1]} cannot be traded.`)
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
                .addFields(...offersToFields(trade))
                .setColor("#E82727")
            );
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
                        .setTitle(`You haven't offered any ${NAMES[item][1]} ${EMOJIS[item]}.`)
                        .setColor("#E82727")
                    );
                    return;
                }

                offer[item] = Math.max(0, offer[item] - count);

                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Trade offers`)
                    .addFields(...offersToFields(trade))
                    .setColor("#E82727")
                );
            }
            break;
        }
        case undefined: {
            const trade = trades.find(t => t.channel === message.channel && t.ids.includes(message.author.id));
            if (!trade) {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Command syntax:`)
                    .setDescription(`\`\`\`${prefix}trade <@user>\n${prefix}trade add <item> [count]\n${prefix}trade remove <item> [count]\`\`\``)
                    .setColor("#E82727")
                );
                return;
            }
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Trade offers`)
                .addFields(...offersToFields(trade))
                .setColor("#E82727")
            ).then(initMsg => {
                initMsg.react("✅").then(() => initMsg.react("❌"));
                let reacted0 = false;
                let reacted1 = false;
                const reactionCollector = initMsg.createReactionCollector((reaction, user) =>
                    (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") &&
                    (user.id === trade.ids[0] && (!reacted0 || reaction.emoji.name === "❌") && (reacted0 = true)) ||
                    (user.id === trade.ids[1] && (!reacted1 || reaction.emoji.name === "❌") && (reacted1 = true)),
                    { max: 2, time: 60000 }
                );

                reactionCollector.on("collect", (reaction, user) => {
                    if (reaction.emoji.name === "❌") {
                        reactionCollector.stop();
                        initMsg.edit(new Discord.MessageEmbed()
                            .setTitle(`Trade cancelled.`)
                            .setColor("#E82727")
                        );
                        trades.splice(trades.indexOf(trade), 1);
                        return;
                    }
                    if (reacted0 && reacted1) {
                        const fields = offersToFields(trade);
                        fields[1].name = "⇄";
                        initMsg.edit(new Discord.MessageEmbed()
                            .setTitle(`Trade accepted! ✅`)
                            .setDescription(`<@!${trade.ids[0]}> ⇄ <@!${trade.ids[1]}>`)
                            .addFields(fields)
                            .setColor("#E82727")
                        );
                        trades.splice(trades.indexOf(trade), 1);
                        Object.entries(trade.offers[0]).forEach(([item, count]) => trade.invs[0][item] -= count);
                        Object.entries(trade.offers[1]).forEach(([item, count]) => trade.invs[1][item] -= count);

                        Object.entries(trade.offers[0]).forEach(([item, count]) => (item in trade.invs[1]) ? trade.invs[1][item] += count : trade.invs[1][item] = count);
                        Object.entries(trade.offers[1]).forEach(([item, count]) => (item in trade.invs[0]) ? trade.invs[0][item] += count : trade.invs[0][item] = count);
                        return;
                    }
                    initMsg.edit(new Discord.MessageEmbed(initMsg.embeds[0])
                        .setFooter(`${user.tag} has accepted the trade!`)
                    );
                });
            });
            break;
        }
        default: {
            if (message.mentions.members.size) {
                const to = message.mentions.members.first();
                const from = message.author;

                if (to.user.bot) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`You can't trade with bots 🤖`)
                        .setColor("#E82727")
                    );
                    return;
                }

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
                        .setTitle(`${to.tag} doesn't have an inventory 😕`)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (trades.some(t => t.ids.includes(to.id))) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`${to.tag} already has a trade session!`)
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
function offersToFields(trade) {
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