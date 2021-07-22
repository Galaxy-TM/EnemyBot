const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

/** @typedef { Object<string, number> } Recipe */
/** @type { Object<string, Recipe> } */
const RECIPES = require("../lib/recipes");

const HIDDENCRAFTS = [...require("../lib/trophies.json")];

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [craftName], inventories, prefix, setInv) => {
    if (!(message.author.id in inventories)) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle("You do not have an inventory.")
            .setColor("#E82727")
        );
        return;
    }
    const inv = inventories[message.author.id];
    if (!craftName) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Crafting Recipes`)
            .setColor("#E82727")
            .addFields(Object.entries(RECIPES).map(([name, recipe]) => (!HIDDENCRAFTS.includes(name) || Object.entries(recipe).reduce((a, [item, count]) => a && (item in inv) && inv[item] >= count, true)) ? {
                name: `${NAMES[name][0]} ${EMOJIS[name]}  ${Object.entries(recipe).reduce((a, [item, count]) => a && (item in inv) && inv[item] >= count, true) ? "✅" : "❌"}          \u200c`,
                value: Object.entries(recipe).map(([cell, count]) => `**${count}** ${EMOJIS[cell]}`).join("; "),
                inline: true
            } : false).filter(n => n))
        );
        return;
    }
    if (craftName in RECIPES && (!HIDDENCRAFTS.includes(craftName) || Object.entries(RECIPES[craftName]).reduce((a, [item, count]) => a && (item in inv) && inv[item] >= count, true))) {
        const RECIPE = RECIPES[craftName];
        const str = [];
        let canCraft = true;
        for (let component in RECIPE) {
            const required = RECIPE[component];
            if (component in inv) {
                const has = inv[component];
                str.push(`${has >= required ? "✅" : "❌"} ${has}/${required} ${NAMES[component][1 - (required === 1)]}`);
                canCraft = canCraft && (has >= required);
            } else {
                str.push(`❌ 0/${required} ${NAMES[component][1 - (required === 1)]}`);
                canCraft = false;
            }
        }
        const NAME = NAMES[craftName][0];
        const EMOJI = EMOJIS[craftName];
        const ARTICLE = NAMES[craftName][2];
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(canCraft 
                ? `You have enough resources to craft ${ARTICLE} ${NAME} ${EMOJI}!` 
                : `You do not have enough resources to craft ${ARTICLE} ${NAME} ${EMOJI}.`
            )
            .setColor("#E82727")
            .setDescription(str.join("\n"))
            .setFooter(canCraft
                ? `React with ✅ to confirm crafting, react with ❌ to cancel crafting.`
                : `Tip: use ${prefix}hunt to hunt every hour and ${prefix}daily to claim your daily crate`
            )
        ).then(confirmMsg => {
            if (canCraft) {
                confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
            }
            confirmMsg.awaitReactions(
                (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id, 
                { max: 1, time: 60000 }
            ).then(collected => {
                if (collected.first() && collected.first().emoji.name === "✅") {
                    for (let item in RECIPE) {
                        inv[item] -= RECIPE[item];
                    }
                    if (!([craftName][0] in inv)) inv[craftName] = 0;
                    inv[[craftName][0]]++;
                    confirmMsg.edit(new Discord.MessageEmbed()
                        .setTitle(`Crafted ${ARTICLE} ${NAME} ${EMOJI}`)
                        .setColor("#E82727")
                    );
                    setInv();
                } else {
                    confirmMsg.edit(new Discord.MessageEmbed()
                        .setTitle("Cancelled crafting.")
                        .setColor("#E82727")
                    );
                }
            }).catch(console.error);
        });
    } else {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Craft ${craftName} is invalid.`)
            .setColor("#E82727")
        );
    }
};