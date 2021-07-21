const Discord = require("discord.js");
const NAMES = require("../lib/names");
const EMOJIS = require("../lib/emojis");

const HIDDEN = ["rickroll"];

/** @type {import("../index").CommandFunc} */
module.exports = (message) => {
    message.channel.send(new Discord.MessageEmbed()
        .setTitle("Items:")
        .addFields({
            name: "Internal                         \u200c",
            value: Object.keys(NAMES).filter(item => !HIDDEN.includes(item)).join("\n"),
            inline: true
        },{
            name: "Display                         \u200c",
            value: Object.entries(NAMES).filter(([item]) => !HIDDEN.includes(item)).map(([_i, name]) => name[0]).join("\n"),
            inline: true
        },{
            name: "Emoji                         \u200c",
            value: Object.keys(NAMES).filter(item => !HIDDEN.includes(item)).map(item => EMOJIS[item] || "`[MISSING]`").join("\n"),
            inline: true
        })
        .setColor("#E82727")
    );
};