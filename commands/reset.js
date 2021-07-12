const EMOJIS = require("../lib/emojis");
const Discord = require("discord.js");

module.exports = {
    cooldown: 0,
    func: (message, _c, _a, inventories, setInv, setCD) => {
        if (["702757890460745810", "520293520418930690"].includes(message.author.id)) {
            message.channel.send(new Discord.MessageEmbed()
                .setAuthor("⚠️ DANGER")
                .setTitle("Are you sure you want to reset inventories and cooldowns?")
                .setDescription("This action is irreversible!")
                .setColor("#E82727")
            ).then(confirmMsg => {
                confirmMsg.react("✅").then(() => confirmMsg.react("❌"));
                confirmMsg.awaitReactions(
                    (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id, 
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
                            .setTitle("Cancelled.")
                            .setColor("#E82727")
                        )
                    }
                }).catch(console.error);
            });
        } else {
            message.channel.send(`You cant do that lmao ${EMOJIS.enemy}`);
        }
    }
};