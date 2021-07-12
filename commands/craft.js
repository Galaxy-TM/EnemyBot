const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

const RECIPES = {
    arrow_shooter: {
        mover: 1,
        rotator: 2,
        generator: 1
    }
};

module.exports = {
    cooldown: 1000,
    func: (message, _c, args, inventories, setInv) => {
        if (!(message.author.id in inventories)) {
            message.channel.send("Since you don't have an inventory, I won't bother evaluating.");
            return;
        }
        if (!args[0]) {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Crafting Recipes`)
                .setColor("#E82727")
                .addFields(Object.entries(RECIPES).map(([name, recipe]) => ({
                    name: `${NAMES[name][0]} ${EMOJIS[name]}`,
                    value: Object.entries(recipe).map(([cell, count]) => `**${count}** ${NAMES[cell][count === 1 ? 0 : 1]} ${EMOJIS[cell]}`).join("\n")
                })))
            );
            return;
        }
        if (args[0] in RECIPES) {
            const str = [];
            const inv = inventories[message.author.id];
            let canCraft = true;

            for (let component in RECIPES[args[0]]) {
                const required = RECIPES[args[0]][component];
                if (component in inv) {
                    const has = inv[component];
                    str.push(`${has >= required ? "✅" : "❌"} ${has}/${required} ${NAMES[component][1 - (required === 1)]}`);
                    canCraft = canCraft && (has >= required);
                } else {
                    str.push(`❌ 0/${required} ${NAMES[component][1 - (required === 1)]}`);
                    canCraft = false;
                }
            }
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(canCraft 
                    ? `You have enough resources to craft ${NAMES[args[0]][0]} ${EMOJIS[args[0]]}!` 
                    : `You do not have enough resources to craft ${NAMES[args[0]][0]} ${EMOJIS[args[0]]}.`
                )
                .setColor("#E82727")
                .setDescription(str.join("\n"))
            ).then(confirmMsg => {
                if (canCraft) {
                    confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
                }
            });
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Craft ${args[0]} is invalid.`)
                .setColor("#E82727")
            );
        }
    }
}