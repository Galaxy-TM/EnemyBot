require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "-";

/** @type { { [ name: string ]: string } } */
const EMOJIS = require("./lib/emojis");
const ADMINID = ["702757890460745810", "520293520418930690", "719163211793825792"];

// Inv
const db = new (require("@replit/database"))();

/**
 * @typedef { { [item: string]: number } } InvLike
 * @typedef { { [id: string]: InvLike } } InvsLike
 * @typedef { (message: Discord.Message, commandName: string, args: string[], inventories: InvsLike, prefix: string, setInv: (inv?: InvsLike) => void, setCD: (cd?: InvsLike) => void) => void } CommandFunc
 * @typedef { { cooldown: number, aliases: string[], syntax: string, description: string, category: string, func: CommandFunc, perms: "NORMAL" | "ADMIN" } } Command
 */
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

const categories = ["cell", "craft", "other"];
const CATEGORYNAMES = {
    cell: `${EMOJIS.mover} Cells`,
    craft: `${EMOJIS.arrow_shooter} Crafts`,
    other: `⚙ Others`,
    admin: `🔧 Admin`
}
/** @type { { [cmdName: string]: Command } } */
const commands = {
    search: {
        cooldown: 60 * 60 * 1000,
        aliases: ["search", "s"],
        syntax: `${prefix}search - Find a random Cell, can be used every hour`,
        description: `Use every hour to get some ${EMOJIS.mover}`,
        category: "cell",

        func: require("./commands/search"),
        perms: "NORMAL"
    },
    bank: {
        cooldown: 1000,
        aliases: ["bank", "b"],
        syntax: `${prefix}bank - See the cell in your inventory\n${prefix}bank <@user> - See the cells in a user's inventory`,
        description: `Check on your ${EMOJIS.mover}`,
        category: "cell",

        func: require("./commands/bank"),
        perms: "NORMAL"
    },
    crafts: {
        cooldown: 1000,
        aliases: ["crafts", "cs"],
        syntax: `${prefix}crafts - See the crafts in your inventory\n${prefix}crafts <@user> - See the crafts a user has made`,
        description: `Check on your ${EMOJIS.arrow_shooter}`,
        category: "craft",

        func: require("./commands/crafts"),
        perms: "NORMAL"
    },
    trophies: {
        cooldown: 1000,
        aliases: ["trophies", "trp"],
        syntax: `${prefix}trophies - See the trophies you have collected (if any)\n${prefix}trophies <@user> - See the trophies of other users`,
        description: `See your 🏆`,

        func: require("./commands/trophies"),
        perms: "NORMAL"
    },
    daily: {
        cooldown: 23 * 60 * 60 * 1000 + 40 * 60 * 1000,
        aliases: ["daily", "d"],
        syntax: `${prefix}daily - Open your daily crate!`,
        description: `Use everyday for 2-4 ${EMOJIS.mover}`,
        category: "cell",

        func: require("./commands/daily"),
        perms: "NORMAL"
    },
    craft: {
        cooldown: 1000,
        aliases: ["craft", "c"],
        syntax: `${prefix}craft - Get a list of crafting recipes\n${prefix}craft <craft_name> - Craft a craft, where craft_name is the internal name (see ${prefix}items)`,
        description: `Craft some ${EMOJIS.arrow_shooter}`,
        category: "craft",

        func: require("./commands/craft"),
        perms: "NORMAL"
    },
    help: {
        cooldown: 1000,
        aliases: ["help", "h"],
        syntax: `${prefix}help - Get a list of command\n${prefix}help <command> - Get info about the command`,
        description: `See a list of commands`,

        func: (message, _c, [cmdArg]) => {
            if (cmdArg) {
                let [cmdName, command] = Object.entries(commands).find(([_n, { aliases }]) => aliases.includes(cmdArg)) || [undefined, undefined];
                if (!command) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Could not find command \`${cmdArg}\``)
                        .setColor("#E82727")
                    );
                    return;
                }
                if (command.perms !== "ADMIN" || ADMINID.includes(message.author.id)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle(`Help: ${cmdName} ${EMOJIS[cmdName]}`)
                        .setDescription(command.description)
                        .addField(
                            `Aliases: ${command.aliases.join(", ")}`,
                            `Syntax: \`\`\`\n${command.syntax}\n\`\`\``
                        )
                        .setColor("#E82727")
                    );
                }
            } else {
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle("Command List:")
                    .setColor("#E82727")
                    .addFields(categories.map(category => ({
                        name: `${CATEGORYNAMES[category]}: `,
                        value: Object.entries(commands).filter(([_n, command]) => command.category === category).map(([name]) => `\`${prefix}${name}\``).join(", ") || "[EMPTY]"
                    })))
                );
                if (ADMINID.includes(message.author.id)) {
                    message.channel.send(new Discord.MessageEmbed()
                        .setTitle("🔧 Admin Commands")
                        .setColor("#E82727")
                        .addField(
                            `${CATEGORYNAMES.admin}: `,
                            Object.entries(commands).filter(([_n, command]) => command.category === "admin").map(([name]) => `\`${prefix}${name}\``).join(", ") || "[EMPTY]"
                        )
                    )
                }
            }
        }
    },
    give: {
        cooldown: 1000,
        aliases: ["give", "gift", "g"],
        syntax: `${prefix}give <@user> <item> [count] - <item> is the internal name (see ${prefix}items)`,
        description: `Give someone some items`,

        func: require("./commands/give"),
        perms: "NORMAL"
    },
    trade: {
        cooldown: 1000,
        aliases: ["trade", "tr", "t"],
        syntax: `${prefix}trade - Display current trade offers (if any)\n${prefix}trade <@user> - Initiate a trade with the user\n${prefix}trade add <item> [count] - Add items to your offer. <item> is internal name (see ${prefix}items)\n${prefix}trade remove <item> [count] - Remove items from your offer. <item> is internal name (see ${prefix}items)`,
        description: `Trade with someone`,

        func: require("./commands/trade"),
        perms: "NORMAL"
    },
    items: {
        cooldown: 0,
        aliases: ["items", "i"],
        syntax: `${prefix}items - Get a list of items, their internal name, and emojis.`,
        description: `Lists items`,

        func: require("./commands/items"),
        perms: "NORMAL"
    },
    add: {
        cooldown: 0,
        aliases: ["add"],
        syntax: `${prefix}add <@user> <item> [count] - <item> is the internal name (see ${prefix}items)`,
        description: `Materialise items out of nowhere`,
        category: "admin",

        func: require("./commands/add"),
        perms: "ADMIN"
    },
    reset: {
        cooldown: 0,
        aliases: ["reset"],
        syntax: `${prefix}reset ?<type: cd | inv | all> - reset.`,
        description: `Reset everyone's progress\n|| Ooooh what does this red button do- 👉🔴 ||`,
        category: "admin",

        func: require("./commands/reset"),
        perms: "ADMIN"
    },
    status: {
        cooldown: 0,
        aliases: ["status"],
        syntax: `${prefix}status <type> <...status> - s t a t u s`,
        description: `Set the bot's status`,
        category: "admin",

        func: (_m, _c, [type, ...status]) => {
            client.user.setActivity(status.join(" "), { type });
        },
        perms: "ADMIN"
    },
    setInfinity: {
        cooldown: 0,
        aliases: ["setInfinity"],
        syntax: `${prefix}setInfinity <item> - <item> is internal name (see ${prefix}items)`,
        description: `Gives Infinite items to the bot`,
        category: "admin",

        func: require("./commands/setInfinity"),
        perms: "ADMIN"
    }
};

// discord bot stuff
client.once("ready", () => {
    console.log("Logged in as", client.user.tag);
});

const CHANNELIDS = ["863672313785876500"];

client.on("message", message => {
    if (!inventories) return;
    if (!cooldowns) return;

    if (message.author.bot) return;
    if (!(ADMINID.includes(message.author.id) || CHANNELIDS.includes(message.channel.id) && message.guild)) return;

    if (!message.content.startsWith(prefix)) return;

    const [commandName, ...args] = message.content.slice(prefix.length).split(/ +/g);
    for (let c in commands) {
        const command = commands[c];
        if (!command.aliases.includes(commandName)) continue;

        if (command.perms === "ADMIN" && !ADMINID.includes(message.author.id)) {
            return;
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
    client.user.setActivity(`the dev die 😀`, { type: "WATCHING" });
    require("express")().get("/", (_req, res) => res.send("Bot Online")).listen("80");
}).catch(console.error);

"";