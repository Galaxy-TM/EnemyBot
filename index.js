require("dotenv").config();
const Discord = require("discord.js");  
const client = new Discord.Client();
const prefix = "-";
const EMOJIS = require("./lib/emojis");
const ADMINID = ["702757890460745810", "520293520418930690"];

/** @typedef {Object<string, Object<string, number>>} InvsLike */
// Inv
const db = new (require("@replit/database"))();
/** @type {InvsLike} */
let inventories = null;
db.get("inv").then(inv => {
    if (inv) {
        inventories = inv;
    } else {
        inventories = {};
        db.set("inv", {});
    }
});
/** @type {InvsLike} */
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
    let fSeconds = Math.round(ms / 10) / 100 % 1;
    let seconds = Math.floor(ms / 1000) % 60;
    let minutes = Math.floor(ms / 60000) % 60;
    let hours = Math.floor(ms / 3600000) % 24;

    if (!minutes && !hours) {
        return `${fSeconds} second${fSeconds === 1 ? "" : "s"}`;
    }
    if (!hours) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} and ${seconds} second${seconds === 1 ? "" : "s"}`;
    }
    return `${hours} hour${hours === 1 ? "" : "s"} and ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

/** @type {Object<string, { cooldown: number, aliases: string[], func: (message: Discord.Message, commandName: string, args: string[], inventories: InvsLike, setInv: (inv?: InvsLike) => void, setCD: (cd?: InvLike) => void) => void }>} */
const commands = {
    hunt: {
        cooldown: 60 * 60 * 1000,
        aliases: ["hunt", "h"],
        func: require("./commands/hunt"),
        perms: "NORMAL"
    },
    reset: {
        cooldown: 0,
        aliases: ["reset"],
        func: require("./commands/reset"),
        perms: "ADMIN"
    },
    bank: {
        cooldown: 1000,
        aliases: ["bank", "b", "inv", "i"],
        func: require("./commands/bank"),
        perms: "NORMAL"
    },
    daily: {
        cooldown: 23 * 60 * 60 * 1000 + 40 * 60 * 1000,
        aliases: ["daily", "d"],
        func: require("./commands/daily"),
        perms: "NORMAL"
    },
    craft: {
        cooldown: 10 * 1000,
        aliases: ["craft", "c"],
        func: require("./commands/craft"),
        perms: "NORMAL"
    },
    give: {
        cooldown: 1000,
        aliases: ["give"],
        func: require("./commands/give"),
        perms: "ADMIN"
    },
    help: {
        cooldown: 1000,
        aliases: ["help"],
        func: message => {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Help")
                .addFields(Object.entries(commands).map(([cmdName, {cooldown, aliases, perms}]) => ({
                    name: cmdName,
                    value: `Cooldown: ${toTime(cooldown)}\nAliases: ${aliases.join(", ")}\nPerms: ${perms}`
                })))
            );
        },
        perms: "NORMAL"
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

        const cdTime = cooldowns[message.author.id][c] + command.cooldown - Date.now();

        if (cdTime > 0) {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle(`Sorry! This command can be used again in **${toTime(cdTime)}**`)
                .setColor("#E82727")
            );
        } else {
            cooldowns[message.author.id][c] = Date.now();
            command.func(message, commandName, args, inventories, set => {
                if (set) inventories = set;
                db.set("inv", inventories);
            }, set => {
                if (set) cooldowns = set;
                db.set("cd", cooldowns);
            });
        }
    }
});


client.login(process.env.TOKEN).then(() => {
    client.user.setActivity("Channel " + CHANNELID, { type: "LISTENING" });
}).catch(console.error);

"";