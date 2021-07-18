require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "-";

const EMOJIS = require("./lib/emojis");
const ADMINID = ["702757890460745810", "520293520418930690"];

// Inv
const db = new (require("@replit/database"))();

let inventories = null;
db.get("inv").then(inv => {
    if (inv) {
        inventories = inv;
    } else {
        inventories = {};
        db.set("inv", {});
    }
});

let cooldowns = null;
db.get("cd").then(cd => {
    if (cd) {
        cooldowns = cd;
    } else {
        cooldowns = {};
        db.set("cd", {});
    }
});


function toTime(ms = 0) {
    let fSeconds = Math.round(ms / 10) / 100;
    let seconds = Math.floor(ms / 1000) % 60;
    let minutes = Math.floor(ms / 60000) % 60;
    let hours = Math.floor(ms / 3600000) % 24;

    if (!minutes && !hours) {
        return `${fSeconds} second${fSeconds === 1 ? "" : "s"}`;
    }
    if (!hours) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} and ${seconds} second${seconds === 1 ? "" : "s"}`;
    }
    if (!minutes) {
        return `${hours} hour${hours === 1 ? "" : "s"}`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"} and ${minutes} minute${minutes === 1 ? "" : "s"}`;
}
const commands = {
    search: {
        cooldown: 60 * 60 * 1000,
        aliases: ["search", "s"],
        syntax: `${prefix}search`,
        description: `Use every hour to get some ${EMOJIS.mover}`,

        func: require("./commands/search"),
        perms: "NORMAL"
    },
    bank: {
        cooldown: 1000,
        aliases: ["bank", "b"],
        syntax: `${prefix}bank ?<@user>`,
        description: `Check on your ${EMOJIS.mover}`,

        func: require("./commands/bank"),
        perms: "NORMAL"
    },
    crafts: {
        cooldown: 1000,
        aliases: ["crafts", "cs"],
        syntax: `${prefix}crafts ?<@user>`,
        description: `Check on your ${EMOJIS.arrow_shooter}`,

        func: require("./commands/crafts"),
        perms: "NORMAL"
    },
    daily: {
        cooldown: 23 * 60 * 60 * 1000 + 40 * 60 * 1000,
        aliases: ["daily", "d"],
        syntax: `${prefix}daily`,
        description: `Use everyday for 2-4 ${EMOJIS.mover}`,

        func: require("./commands/daily"),
        perms: "NORMAL"
    },
    craft: {
        cooldown: 1000,
        aliases: ["craft", "c"],
        syntax: `${prefix}craft ?<craft_name>`,
        description: `Craft some ${EMOJIS.arrow_shooter}`,

        func: require("./commands/craft"),
        perms: "NORMAL"
    },
    help: {
        cooldown: 1000,
        aliases: ["help", "h"],
        syntax: `${prefix}help ?<command>`,
        description: `See a list of commands`,

        func: (message, _c, [cmdArg]) => {
            if (cmdArg) {
                let [cmdName, command] = Object.entries(commands).find(([_n, { aliases }]) => aliases.includes(cmdArg));
                if (command && command.perms !== "ADMIN" || ADMINID.includes(message.author.id)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Help: ${cmdName} ${EMOJIS[cmdName]}`)
                        .setDescription(command.description)
                        .addField(
                            `\`${command.syntax}\``,
                            `Aliases: ${command.aliases.join(", ")}`
                        )
                        .setColor("#E82727")
                    );
                } else {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Could not find command \`${cmdArg}\``)
                        .setColor("#E82727")
                    );
                }
            } else {
                const commandsStr = Object.entries(commands).map(([cmdName, { perms }]) => ({
                    str: `${EMOJIS[cmdName]} ${cmdName}`,
                    perms
                }));
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle("Commands")
                    .setColor("#E82727")
                    .setDescription(commandsStr.filter(({ perms }) => perms === "NORMAL").map(({ str }) => str).join("\n"))
                );
                if (ADMINID.includes(message.author.id)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle("🔧 Admin Commands")
                        .setColor("#E82727")
                        .setDescription(commandsStr.filter(({ perms }) => perms === "ADMIN").map(({ str }) => str).join("\n"))
                    )
                }
            }
        }
    },
    give: {
        cooldown: 1000,
        aliases: ["give", "gift", "g"],
        syntax: `${prefix}give <@user> <item> [count]`,
        func: require("./commands/give"),
        perms: "NORMAL"
    },
    add: {
        cooldown: 0,
        aliases: ["add"],
        syntax: `${prefix}add <@user> <item> [count]`,
        description: `Materialise items out of nowhere`,

        func: require("./commands/add"),
        perms: "ADMIN"
    },
    reset: {
        cooldown: 0,
        aliases: ["reset"],
        syntax: `${prefix}reset ?<type: cd | inv | all>`,
        description: `Reset everyone's progress\n||Ooooh what does this red button do- 👉🔴||`,

        func: require("./commands/reset"),
        perms: "ADMIN"
    },
    status: {
        cooldown: 0,
        aliases: ["status"],
        syntax: `${prefix}status <type> <...status>`,
        description: `Set the bot's status`,

        func: (_m, _c, [type, ...status]) => {
            client.user.setActivity(status.join(" "), { type });
        },
        perms: "ADMIN"
    },
    setInfinity: {
        cooldown: 0,
        aliases: ["setInfinity"],
        syntax: `${prefix}setInfinity <item>`,
        description: `Gives Infinite items to the bot`,

        func: require("./commands/setInfinity"),
        perms: "ADMIN"
    }
};

// discord bot stuff
client.once("ready", () => {
    console.log("Logged in as", client.user.tag);
});

const CHANNELID = "863672313785876500";
const GUILDID = "852889827229564958";

client.on("message", message => {
    if (!inventories) return;
    if (!cooldowns) return;
    if (message.guild.id !== GUILDID) return;
    if (message.channel.id !== CHANNELID) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;

    const [commandName, ...args] = message.content.slice(prefix.length).split(/ +/g);
    for (let c in commands) {
        const command = commands[c];
        if (!command.aliases.includes(commandName)) continue;

        if (command.perms === "ADMIN" && !ADMINID.includes(message.author.id)) {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`You don't have the permissions to do that ${EMOJIS.enemy}`)
                .setColor("#E82727")
            );
            return;
        } else if (command.perms === "NORMAL") {

        }

        if (!(message.author.id in cooldowns)) cooldowns[message.author.id] = {};

        const cd = cooldowns[message.author.id];

        const cdTime = (cd[c] || 0) + command.cooldown - Date.now();

        if (cdTime > 0) {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Sorry! This command can be used again in **${toTime(cdTime)}**`)
                .setColor("#E82727")
            );
        } else {
            cd[c] = Date.now();
            command.func(message, commandName, args, inventories, prefix, set => {
                if (set) inventories = set;
                db.set("inv", inventories);
            }, set => {
                if (set) cooldowns = set;
                db.set("cd", cooldowns);
            });
            db.set("cd", cooldowns);
        }
    }
});


client.login(process.env.TOKEN).then(() => {
    client.user.setActivity(`${prefix}search`, { type: "PLAYING" });
    require("express")().get("/", (_req, res) => res.send("Bot Online")).listen("80");
}).catch(console.error);

"";