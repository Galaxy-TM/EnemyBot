const Discord = require("discord.js");
const NAMES = require("../lib/names");
const EMOJIS = require("../lib/emojis");

/** @type {import("../index").CommandFunc} */
module.exports = (message) => {
    message.channel.send(new Discord.MessageEmbed()
        .setTitle("Items:")
        .addFields({
            name: "Internal                    \u200c",
            value: Object.keys(NAMES).join("\n"),
            inline: true
        },{
            name: "Display                    \u200c",
            value: Object.entries(NAMES).map(([_i, name]) => name[0]).join("\n"),
            inline: true
        },{
            name: "Emoji                    \u200c",
            value: Object.keys(NAMES).map(item => EMOJIS[item] || "`[MISSING]`").join("\n"),
            inline: true
        })
        .setColor("#E82727")
    );
};