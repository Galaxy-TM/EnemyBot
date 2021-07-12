const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");
const order = Object.keys(NAMES);
module.exports = {
    cooldown: 1000,
    func: (message, _c, [id], inventories) => {
        let name;
        let avatar;
        if (!id) {
            id = message.author.id;
            name = message.author.username;
            avatar = message.author.avatarURL();
        } else if (isNaN(id)) {
            if (message.mentions.members.size) {
                const member = message.mentions.members.first();
                id = member.id;
                name = member.nickname;
                avatar = member.user.avatarURL();
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
                .setAuthor(`${name || id}'s Bank (×${Object.entries(inv).reduce((a, [_cell, count]) => a + Number(count), 0)})`, avatar) 
                .setColor("#E82727")
                .setDescription(order.map(cell => {
                    if (!(cell in inv)) return false;
                    let count = inv[cell];
                    return `**${count}** ${NAMES[cell][count === 1 ? 0 : 1]} ${EMOJIS[cell]}`;
                }).filter(s => s).join("\n"))
            );
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`${name || id}'s Bank is empty!`)
                .setDescription('Use `-hunt` to get cells!')
                .setColor("#E82727")
            );
        }
    }
};