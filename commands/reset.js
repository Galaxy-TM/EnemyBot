const EMOJIS = require("../lib/emojis");
const Discord = require("discord.js");

module.exports = (message, _c, _a, _i, _p, setInv, setCD) => {
    message.channel.send(new Discord.MessageEmbed()
        .setAuthor("⚠️ DANGER")
        .setTitle("Are you sure you want to reset inventories and cooldowns?")
        .setDescription("This action is irreversible!")
        .setColor("#E82727")
    ).then(confirmMsg => {
        confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
        confirmMsg.awaitReactions(
            (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") &&user.id === message.author.id, 
            { max: 1, time: 60000 }
        ).then(collected => {
            let reaction = collected.first();
            if (reaction.emoji.name === "✅") {
                setInv({
                    "862698871624957982": {
                        mover: "Infinity",
                        generator: "Infinity",
                        push: "Infinity",
                        slide: "Infinity",
                        rotator: "Infinity",
                        rotator_ccw: "Infinity",
                        trash: "Infinity",
                        enemy: "Infinity"
                    }
                });
                setCD({});
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