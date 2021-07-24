const Discord = require("discord.js");
const EMOJIS = require("../lib/emojis.json");
const { commands, ADMINIDS } = require("../index");

const categories = ["cell", "craft", "other"];
const CATEGORYNAMES = {
    cell: `${EMOJIS.mover} Cells`,
    craft: `${EMOJIS.arrow_shooter} Crafts`,
    other: `⚙ Others`,
    admin: `🔧 Admin`
};

const embed = new Discord.MessageEmbed()
    .setTitle("Command List:")
    .setColor("#E82727")
    .addFields(categories.map(category => ({
        name: `${CATEGORYNAMES[category]}: `,
        value: Object.entries(commands).filter(([_n, command]) => command.category === category).map(([name]) => `\`${prefix}${name}\``).join(", ") || "[EMPTY]"
    })));
const adminEmbed = new Discord.MessageEmbed()
    .setTitle("Command List:")
    .setColor("#E82727")
    .addFields([...categories, "admin"].map(category => ({
        name: `${CATEGORYNAMES[category]}: `,
        value: Object.entries(commands).filter(([_n, command]) => command.category === category).map(([name]) => `\`${prefix}${name}\``).join(", ") || "[EMPTY]"
    })));

const embeds = Object.fromEntries([].concat(...Object.entries(commands).filter(([_n, command]) => command.perms === "NORMAL").map(([cmdName, command]) => command.aliases.map(
    alias => [alias, new Discord.MessageEmbed()
        .setTitle(`Help: ${cmdName} ${EMOJIS[cmdName]}`)
        .setDescription(command.description)
        .addField(
            `Aliases: ${command.aliases.join(", ")}`,
            `Syntax: \`\`\`\n${command.syntax}\n\`\`\``
        )
        .setColor("#E82727")
    ]
))));
const adminEmbeds = Object.fromEntries([].concat(...Object.entries(commands).map(([cmdName, command]) => command.aliases.map(
    alias => [alias, new Discord.MessageEmbed()
        .setTitle(`Help: ${cmdName} ${EMOJIS[cmdName]}`)
        .setDescription(command.description)
        .addField(
            `Aliases: ${command.aliases.join(", ")}`,
            `Syntax: \`\`\`\n${command.syntax}\n\`\`\``
        )
        .setColor("#E82727")
    ]
))));

console.log(embeds, adminEmbeds);

/** @type {import("../index").CommandFunc} */
module.exports = (message, _c, [cmdArg]) => {
    if (cmdArg) {
        message.channel.send(new Discord.MessageEmbed((ADMINIDS.includes(message.author.id) ? adminEmbeds : embeds)[cmdArg] || new Discord.MessageEmbed()
            .setTitle(`Could not find command \`${cmdArg}\``)
            .setColor("#E82727")
        ));
    } else {
        message.channel.send(new Discord.MessageEmbed((ADMINIDS.includes(message.author.id) ? adminEmbed : embed)));
    }
};