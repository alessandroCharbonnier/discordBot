const Discord = require("discord.js");
const bot = new Discord.Client();
const moment = require("moment");
//loading config file
const config = require("./config.json");
const secret = require("./config_secret.json");

// connect the bot
bot.login(secret.token).catch((err) => console.error(err));

let owner;

function ownerMessage(message, logValue) {
    let logMessage = "";
    switch (logValue) {
        case 0:
            logMessage = ":green_circle:";
            break;
        case 1:
            logMessage = ":orange_circle:";
            break;
        case 1:
            logMessage = ":red_circle:";
            break;
        default:
            break;
    }
    owner.send(`${logMessage} ${message}`).catch((err) => console.error(err));
}

// log that the bot is ready (optional)
bot.once("ready", () => {
    bot.user.setActivity("confinement depuis " + moment("2020-03-17-12-00", "YYYY-MM-DD-HH-mm").fromNow().slice(0, -3));
    setInterval(() => {
        bot.user.setActivity("confinement depuis " + moment("2020-03-17-12-00", "YYYY-MM-DD-HH-mm").fromNow().slice(0, -3));
    }, 1000 * 60 * 60);
    owner = bot.users.get(config.owner);
    ownerMessage(config.onLaunchMessage);
});

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
    try {
        let name = newUserChannel.name + "-" + config.profs[Math.floor(Math.random() * config.profs.length)];

        newMember.guild.createChannel(name, { type: "voice", parent: newUserChannel.parentID }).then((channel) => {
            ownerMessage(`created \`\`${name}\`\``, 0);
            newMember
                .setVoiceChannel(channel)
                .then(ownerMessage(`Moved \`\`${newMember.user.tag}\`\` in \`\`${channel.name}\`\``, 0))
                .catch((err) => console.error(err));
        });
    } catch (err) {
        console.error(err);
    }
}

// delete a voice channel
function deleteChannel(oldUserChannel) {
    oldUserChannel
        .delete()
        .then(ownerMessage(`Deleted \`\`${oldUserChannel.name}\`\` channel`, 1))
        .catch((err) => console.error(err));
}

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
        message.guild.fetchMember(mention).then((guildMember) => {
            guildMember.addRoles(role_obj);
        });
    }
});

// when a user join a channel the bot will add 2 config.roles (specific for every server)
bot.on("guildMemberAdd", (guildMember) => {
    if (guildMember.guild.id == "362958435291103233") {
        guildMember.addRoles(config.roles).catch((err) => console.error(err));
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
