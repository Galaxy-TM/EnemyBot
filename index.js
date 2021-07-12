require("dotenv").config();
const Discord = require("discord.js");  
const client = new Discord.Client();
const prefix = "-";

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


function toTime(ms) {
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


const commands = {
    hunt: require("./commands/hunt"),
    reset: require("./commands/reset"),
    bank: require("./commands/inv"),
    daily: require("./commands/daily"),
    craft: require("./commands/craft")
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

    const [command, ...args] = message.content.slice(prefix.length).split(/ +/g);

    if (command in commands) {
        if (!(message.author.id in cooldowns)) {
            cooldowns[message.author.id] = {};
        }
        if ((cooldowns[message.author.id][command] || 0) + commands[command].cooldown < Date.now()) {
            cooldowns[message.author.id][command] = Date.now();
            db.set("cd", cooldowns);

            commands[command].func(message, command, args, inventories, set => {
                if (set) inventories = set;
                db.set("inv", inventories);
            }, set => {
                if (set) cooldowns = set;
                db.set("cd", cooldowns);
            });
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setTitle("Cooldown!")
                .setColor("#E82727")
                .setDescription(`This command can be used again in ${toTime(commands[command].cooldown - (Date.now() - cooldowns[message.author.id][command]))}. Sorry!`)
            );
        }
    }
});


client.login(process.env.TOKEN).then(() => {
    client.user.setActivity("Channel " + CHANNELID, { type: "LISTENING" });
}).catch(console.error);

"";