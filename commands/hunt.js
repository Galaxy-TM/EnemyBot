const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");
const randomCell = require("../lib/randomCell");

module.exports = (message, _c, _a, inventories, setInv) => {
    if (!(message.author.id in inventories)) inventories[message.author.id] = {};
    const inv = inventories[message.author.id];

    const cell = randomCell();

    if (cell in inv) inv[cell]++;
    else inv[cell] = 1;

    message.channel.send(`You found ${NAMES[cell][2]} ${NAMES[cell][0]}! ${EMOJIS[cell]}`);

    setInv();
};