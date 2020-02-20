const Discord = require("discord.js");
const bot = new Discord.Client();
const process = require("process");

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
    bot.user.setActivity(config.activity);
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

// exit the program is the user hits ctrl+c
process.on("SIGINT", () => {
    ownerMessage("``` END ```");
    bot.destroy().catch((err) => console.error(err));
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
        message.guild.fetchMember(mention).then((guildMember) => {
            guildMember.addRoles(role_obj);
        });
    } else if (message.content.toLowerCase().startsWith("!rename_me")) {
        try {
            message.member.setNickname(message.content.replace("!rename_me ", "")).then(ownerMessage(`Renamed \`\`${message.member.user.tag}\`\` to \`\`${message.content.replace("!rename_me ", "")}\`\``, 0));
        } catch (error) {}
    }
});

// when a user join a channel the bot will add 2 config.roles (specific for every server)
bot.on("guildMemberAdd", (guildMember) => {
    // IA - School
    if (guildMember.guild.id == "647453836151226380") {
        guildMember.addRoles(["647508509323165707"]).catch((err) => console.error(err));
        guildMember.send("Bienvenu sur le Discord de L'IA School\n N'oublie pas de lire la partie 'Les-nouveaux'!").then(() => {
            ownerMessage(`Sent welcome message to \`\`${guildMember.user.tag}\`\``, 0);
        });

        // Chaussure
    } else if (guildMember.guild.id == "362958435291103233") {
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

const events = {
    MESSAGE_REACTION_ADD: "messageReactionAdd",
    MESSAGE_REACTION_REMOVE: "messageReactionRemove"
};

// on reactions added to message
bot.on("raw", (event) => {
    if (events.hasOwnProperty(event.t)) {
        // MATH / PROGRAMMATION
        if (event.d.message_id == "673585200566894624") {
            let guild = bot.guilds.get("647453836151226380");
            guild.fetchMember(event.d.user_id).then((guildMember) => {
                if (event.t === "MESSAGE_REACTION_ADD") {
                    if (event.d.emoji.name === "1️⃣") {
                        guildMember
                            .addRoles(["647506999780573185"])
                            .then(ownerMessage(`Added role \`\` niveau 1 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "2️⃣") {
                        guildMember
                            .addRoles(["647507064616255496"])
                            .then(ownerMessage(`Added role \`\` niveau 2 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    }
                } else if (event.t === "MESSAGE_REACTION_REMOVE") {
                    if (event.d.emoji.name === "1️⃣") {
                        guildMember
                            .removeRole("647506999780573185")
                            .then(ownerMessage(`Removed role \`\` niveau 1 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "2️⃣") {
                        guildMember
                            .removeRole("647507064616255496")
                            .then(ownerMessage(`Removed role \`\` niveau 2 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    }
                }
            });
            // CLASSE
        } else if (event.d.message_id == "673585240870223883") {
            let guild = bot.guilds.get("647453836151226380");
            guild.fetchMember(event.d.user_id).then((guildMember) => {
                if (event.t === "MESSAGE_REACTION_ADD") {
                    if (event.d.emoji.name === "1️⃣") {
                        guildMember
                            .addRoles(["647506640320331786"])
                            .then(ownerMessage(`Added role \`\` B1 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "2️⃣") {
                        guildMember
                            .addRoles(["647506729017540637"])
                            .then(ownerMessage(`Added role \`\` B2 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "3️⃣") {
                        guildMember
                            .addRoles(["647506777260425217"])
                            .then(ownerMessage(`Added role \`\` B3 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "4️⃣") {
                        guildMember
                            .addRoles(["647506852187471884"])
                            .then(ownerMessage(`Added role \`\` M1 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "5️⃣") {
                        guildMember
                            .addRoles(["647506905832620082"])
                            .then(ownerMessage(`Added role \`\` M2 \`\` to \`\`${guildMember.user.tag}\`\``, 0))
                            .catch((err) => console.error(err));
                    } else {
                    }
                } else if (event.t === "MESSAGE_REACTION_REMOVE") {
                    if (event.d.emoji.name === "1️⃣") {
                        guildMember
                            .removeRole("647506640320331786")
                            .then(ownerMessage(`Removed role \`\` B1 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "2️⃣") {
                        guildMember
                            .removeRole("647506729017540637")
                            .then(ownerMessage(`Removed role \`\` B2 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "3️⃣") {
                        guildMember
                            .removeRole("647506777260425217")
                            .then(ownerMessage(`Removed role \`\` B3 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "4️⃣") {
                        guildMember
                            .removeRole("647506852187471884")
                            .then(ownerMessage(`Removed role \`\` M1 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    } else if (event.d.emoji.name === "5️⃣") {
                        guildMember
                            .removeRole("647506905832620082")
                            .then(ownerMessage(`Removed role \`\` M2 \`\` from \`\`${guildMember.user.tag}\`\``, 1))
                            .catch((err) => console.error(err));
                    }
                }
            });
        }
    }
});
