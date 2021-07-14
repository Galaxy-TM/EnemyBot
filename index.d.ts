import Discord from "discord.js";

declare type InvsLike = {
    [id: string]: {
        [item: string]: number;
    };
};
declare type CommandFunc = (message: Discord.Message, commandName: string, args: string[], inventories: InvsLike, prefix: string, setInv: (inv?: InvsLike) => void, setCD: (cd?: InvsLike) => void) => void;
declare type Command = {
    cooldown: number;
    aliases: string[];
    func: CommandFunc;
    perms: "NORMAL" | "ADMIN";
};

declare let inventories: InvsLike;
declare let cooldowns: InvsLike;
declare const commands: {
    [commandName: string]: Command;
};