const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

/** @type {CommandFunc} */
module.exports = (message, _c, [item], inventories, _p, setInv) => {
    if (!item) {
        message.channel.send(new Discord.MessageEmbed()
            .setDescription("what do i set to infinity lol")
            .setColor("#E82727")
        );
        return;
    }
    inventories["862698871624957982"][item] = "Infinity";
    setInv();

    message.channel.send(new Discord.MessageEmbed()
        .setDescription(`**<@!862698871624957982> now has Infinite ${NAMES[item][1]} ${EMOJIS[item]}**`)
        .setColor("#E82727")
    );
};