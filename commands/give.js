const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [id, item, count = 1], inventories, prefix, setInv) => {
    if (!(message.author.id in inventories)) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle("You do not have an inventory.")
            .setColor("#E82727")
        );
        return;
    }
    if (!item) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Command Syntax`)
            .setDescription(`\`${prefix}give <@user> <item> [count]\``)
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
    if (isNaN(count) || (count <= 0) || ((count % 1) !== 0)) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`\`count\` has to be a positive integer number.`)
            .setColor("#E82727")
        );
        return;
    }

    let name;
    let avatar;
    if (!id) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`\`${count}\` has to be a positive integer number.`)
            .setColor("#E82727")
            .setFooter(`See ${prefix}`)
        );
        return;
    } else if (isNaN(id)) {
        if (message.mentions.members.size) {
            const member = message.mentions.members.first();
            id = member.id;
            name = member.nickname || member.user.username;
            avatar = member.user.avatarURL();
            if (member.user.bot) {
                if (member.user.id === "862698871624957982") {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle("I know you want to be generous towards me.")
                        .setDescription("However I already have Infinite stuff!")
                        .setFooter(":(")
                        .setColor("#E82727")
                    );
                    return;
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`${member.nickname || member.user.username} is a bot.`)
                        .setFooter("Bots don't have banks!")
                        .setColor("#E82727")
                    );
                    return;
                }
            }
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Can't find user ${id}`)
                .setColor("#E82727")
            );
            return;
        }
    }

    count = Number(count);

    if (!(id in inventories)) inventories[id] = {};
    const to = inventories[id];

    const from = inventories[message.author.id];

    if (!(item in to)) to[item] = 0;
    if (!(item in from) || from[item] < count) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Your inventory does not have enough ${NAMES[item][1]}`)
            .setColor("#E82727")
        );
        return;
    }

    from[item] -= count;
    to[item] += count;

    message.channel.send(new Discord.MessageEmbed()
        .setTitle(`You have given ${name || id} ${count} ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}.`)
        .setDescription(`They now have ${to[item]} ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}\nand you now have ${from[item]} ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}.`)
        .setColor("#E82727")
    );

    setInv();
};