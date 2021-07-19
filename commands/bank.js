const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");
const order = ["mover", "generator", "push", "slide", "rotator", "rotator_ccw", "trash", "enemy", "rickroll"];

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [id], inventories, prefix) => {
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
    if (id in inventories) {
        const inv = inventories[id];
        message.channel.send(new Discord.MessageEmbed()
            .setAuthor(`${name || id}'s Bank (×${order.map(cell => inv[cell]).filter(n => n && n > 0).reduce((a, count) => a + Number(count), 0)})`, avatar) 
            .setColor("#E82727")
            .setDescription(order.map(cell => {
                if (!inv[cell]) return false;
                let count = inv[cell];
                return `**${count < 0 ? `[DEBT] ${-count}` : count}** ${NAMES[cell][count === 1 ? 0 : 1]} ${EMOJIS[cell]}`;
            }).filter(s => s).join("\n"))
        );
    } else {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`${name || id}'s Bank is empty!`)
            .setFooter(`Use ${prefix}hunt to get cells!`)
            .setColor("#E82727")
        );
    }
};