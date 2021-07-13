const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

module.exports = (message, _c, [id, item = "push", count = 1], inventories, setInv) => {
    if (!(item in NAMES)) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`**${item}** isn't in \`NAMES\`.`)
            .setColor("#E82727")
        );
        return;
    }
    if (isNaN(count)) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`**${count}** needs to be a number.`)
            .setColor("#E82727")
        );
        return;
    }

    let name;
    let avatar;
    if (!id) {
        const member = message.member;
        id = member.id;
        name = member.nickname || member.user.username;
        avatar = member.user.avatarURL();
    } else if (isNaN(id)) {
        if (message.mentions.members.size) {
            const member = message.mentions.members.first();
            id = member.id;
            name = member.nickname || member.user.username;
            avatar = member.user.avatarURL();
            if (member.user.bot) {
                if (member.user.id === "862698871624957982") {
                    name = "VeryEpicEnemyBot69420";
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`${member.nickname || member.user.username} is a bot.`)
                        .setFooter("Bots don't have inventories!")
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

    if (!(id in inventories)) inventories[id] = {};
    const inv = inventories[id];
    if (!(item in inv)) inv[item] = 0;

    count = Number(count);
    inv[item] += count;
    
    message.channel.send(new Discord.MessageEmbed()
        .setTitle(`${name || id} has been given **${count} ${NAMES[item][count === 1 ? 0 : 1]} ${EMOJIS[item]}** and now has **${inv[item]} ${NAMES[item][inv[item] === 1 ? 0 : 1]} ${EMOJIS[item]}**`)
        .setColor("#E82727")
    );
};