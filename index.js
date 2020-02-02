const Discord = require("discord.js");
const bot = new Discord.Client();
const process = require("process");

//loading config file
const config = require("./config.json");
const secret = require("./config_secret.json");

// connect the bot
bot.login(secret.token).catch((err) => console.log(err));

// log that the bot is ready (optional)
bot.once("ready", () => {
    bot.user.setActivity(config.activity);
    bot.users
        .get(config.owner)
        .send(config.onLaunchMessage)
        .catch((err) => console.error(err));
});

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
    try {
        let name = newUserChannel.name + "-" + config.profs[Math.floor(Math.random() * config.profs.length)];

        newMember.guild.createChannel(name, { type: "voice", parent: newUserChannel.parentID }).then((channel) => {
            newMember.setVoiceChannel(channel).catch((err) => console.error(err));
        });
    } catch (err) {
        console.error(err);
    }
}

// delete a voice channel
function deleteChannel(oldUserChannel) {
    oldUserChannel.delete().catch((err) => console.log(err));
}

// exit the program is the user hits ctrl+c
process.on("SIGINT", () => {
    bot.destroy().catch((err) => console.log(err));
    process.exit();
});

// on message
bot.on("message", (message) => {
    if (message.content.toLowerCase().startsWith("!chaussure") && message.member.roles.some((r) => ["ADMIN CHAUSSURE"].includes(r.name))) {
        let role_name = "CHAUSSURE";
        let role = message.guild.roles;
        let role_obj = role.find((test) => test.name == role_name);
        if (role_obj == null) {
            message.channel.send("le role " + role_name + " existe pas");
            return;
        }
        let mention = message.mentions.users.first();
        message.guild.fetchMember(mention).then((member) => {
            member.addRoles(role_obj);
        });
    }
});

// when a user join a channel the bot will add 2 config.roles (specific for every server)
bot.on("guildMemberAdd", (member) => {
    // IA - School
    if (member.guild.id == "647453836151226380") {
        member.addRoles(["647508509323165707"]).catch((err) => console.log(err));

        // Chaussure
    } else if (member.guild.id == "362958435291103233") {
        member.addRoles(config.roles).catch((err) => console.log(err));
    }
});

// when a user join/quit/move channel
bot.on("voiceStateUpdate", (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        // User Joins a voice channel
        if (config.channels.includes(newUserChannel.name)) {
            createNewChannel(newMember, newUserChannel);
        }
    } else if (newUserChannel === undefined) {
        // User leaves a voice channel
        if (!config.channels.includes(oldUserChannel.name) && oldUserChannel.members.size === 0 && !config.blackList.includes(oldUserChannel.name)) {
            deleteChannel(oldUserChannel);
        }
    } else if (oldUserChannel !== undefined && newUserChannel !== undefined) {
        // User moved channel
        if (!config.channels.includes(oldUserChannel.name) && oldUserChannel.members.size === 0 && !config.blackList.includes(oldUserChannel.name)) {
            deleteChannel(oldUserChannel);
        }

        if (config.channels.includes(newUserChannel.name) && !config.blackList.includes(newUserChannel.name)) {
            createNewChannel(newMember, newUserChannel);
        }
    }
});
