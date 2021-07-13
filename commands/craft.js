const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis");
const NAMES = require("../lib/names");

const RECIPES = {
    arrow_shooter: {
        mover: 1,
        generator: 1,
        rotator: 2
    },
    mover_gear: {
        mover: 3,
        rotator: 1
    },
    enemy_vault: {
        slide: 4,
        generator: 1
    }
};

module.exports = (message, _c, args, inventories, setInv) => {
    if (!(message.author.id in inventories)) {
        message.channel.send("Since you don't have an inventory, I won't bother evaluating.");
        return;
    }
    if (!args[0]) {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Crafting Recipes`)
            .setColor("#E82727")
            .addFields(Object.entries(RECIPES).map(([name, recipe]) => ({
                name: `${NAMES[name][0]} ${EMOJIS[name]}          \u200c`,
                value: Object.entries(recipe).map(([cell, count]) => `**${count}** ${NAMES[cell][count === 1 ? 0 : 1]} ${EMOJIS[cell]}`).join("\n"),
                inline: true
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
        const NAME = NAMES[args[0]][0];
        const EMOJI = EMOJIS[args[0]];
        const ARTICLE = NAMES[args[0]][2];
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(canCraft 
                ? `You have enough resources to craft ${ARTICLE} ${NAME} ${EMOJI}!` 
                : `You do not have enough resources to craft ${ARTICLE} ${NAME} ${EMOJI}.`
            )
            .setColor("#E82727")
            .setDescription(str.join("\n"))
            .setFooter(canCraft
                ? `React with ✅ to confirm crafting, react with ❌ to cancel crafting.`
                : "Tip: use `-hunt` to hunt every hour and `-daily` to claim your daily crate"
            )
        ).then(confirmMsg => {
            if (canCraft) {
                confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
            }
            confirmMsg.awaitReactions(
                (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id, 
                { max: 1, time: 60000 }
            ).then(collected => {
                let reaction = collected.first();
                if (reaction.emoji.name === "✅") {
                    confirmMsg.edit(new Discord.MessageEmbed()
                        .setTitle(`Crafted ${ARTICLE} ${NAME} ${EMOJI}`)
                        .setColor("#E82727")
                    )
                } else {
                    confirmMsg.edit(new Discord.MessageEmbed()
                        .setTitle("Cancelled crafting.")
                        .setColor("#E82727")
                    )
                }
            }).catch(console.error);
        });
    } else {
        message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Craft ${args[0]} is invalid.`)
            .setColor("#E82727")
        );
    }
};