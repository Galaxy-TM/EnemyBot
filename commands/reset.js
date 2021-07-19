const EMOJIS = require("../lib/emojis");
const Discord = require("discord.js");

/** @type { import("../index").CommandFunc } */
module.exports = (message, _c, [type], _i, _p, setInv, setCD) => {
    const embed = new Discord.MessageEmbed()
        .setAuthor("⚠️ DANGER")
        .setDescription("This action is irreversible!")
        .setColor("#E82727");

    if (!type || type === "all") {
        embed.setTitle("Are you sure you want to reset inventories and cooldowns?");
    } else if (type === "inv") {
        embed.setTitle("Are you sure you want to reset inventories?");
    } else if (type === "cd") {
        embed.setTitle("Are you sure you want to reset cooldowns?");
    }
    message.channel.send(embed).then(confirmMsg => {
        confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
        confirmMsg.awaitReactions(
            (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id,
            { max: 1, time: 60000 }
        ).then(collected => {
            let reaction = collected.first();
            if (reaction.emoji.name === "✅") {
                if (!type || type === "inv" || type === "all") {
                    setInv({
                        "862698871624957982": {
                            mover: "Infinity",
                            generator: "Infinity",
                            push: "Infinity",
                            slide: "Infinity",
                            rotator: "Infinity",
                            rotator_ccw: "Infinity",
                            trash: "Infinity",
                            enemy: "Infinity",

                            arrow_shooter: "Infinity",
                            mover_gear: "Infinity",
                            enemy_vault: "Infinity",
                            counter: "Infinity",
                        }
                    });
                }
                if (!type || type === "cd" || type === "all") {
                    setCD({});
                }
                confirmMsg.edit(new Discord.MessageEmbed()
                    .setTitle("Data has been reset.")
                    .setColor("#E82727")
                )
            } else {
                confirmMsg.edit(new Discord.MessageEmbed()
                    .setTitle("Cancelled data reset.")
                    .setColor("#E82727")
                )
            }
        }).catch(console.error);
    });
};