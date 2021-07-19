const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");
const randomCell = require("../lib/randomCell");

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, _a, inventories, _p, setInv) => {
    if (!(message.author.id in inventories)) inventories[message.author.id] = {};
    const inv = inventories[message.author.id];

    let random = Math.random();
    const amount = 2 + (random < 0.2) + (random < 0.8);
    const cell = randomCell();
        
    if (cell in inv) inv[cell] += amount;
    else inv[cell] = amount;
    
    message.channel.send(new Discord.MessageEmbed()
        .setTitle(`Your daily crate included ${amount} ${NAMES[cell][1]}! ${EMOJIS[cell]}`)
        .setColor("#E82727")
    );
    setInv();
};