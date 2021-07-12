const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");
const randomCell = require("../lib/randomCell");

module.exports = {
    cooldown: 23 * 60 * 60 * 1000 + 40 * 60 * 1000,
    func: (message, _c, _a, inventories, setInv) => {
        if (!(message.author.id in inventories)) inventories[message.author.id] = {};
        const inv = inventories[message.author.id];

        let random = Math.random();
        const amount = 2 + (random < 0.2) + (random < 0.8);
        const cell = randomCell();
            
        if (cell in inv) inv[cell] += amount;
        else inv[cell] = amount;

        message.channel.send(`Your daily crate included ${amount} ${NAMES[cell][1]}! ${EMOJIS[cell]}`);

        setInv();
    }
};