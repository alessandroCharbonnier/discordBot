const colors = require("colors");
const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const request = require("request");
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
	console.clear();
	console.log("Ready!".rainbow.bold.underline);
});

// downloading images from url
function download(url, filename, callback) {
	request.head(url, function(err, res, body) {
		process.stdout.write("downloading " + filename + " from " + url + " ...");

		request(url)
			.pipe(fs.createWriteStream("./Memes_DUT_info/" + filename))
			.on("close", callback);
	});
}

const events = {
	MESSAGE_REACTION_ADD: "messageReactionAdd",
	MESSAGE_REACTION_REMOVE: "messageReactionRemove"
};

// on reactions added to message
bot.on("raw", (event) => {
	if (events.hasOwnProperty(event.t) && event.d.emoji.name === "✅") {
		if (event.d.user_id === config.owner && event.d.channel_id === "456543263625707520") {
			if (event.t === "MESSAGE_REACTION_ADD") {
				const channel = bot.channels.get(event.d.channel_id);

				channel.fetchMessage(event.d.message_id).then((message) => {
					const images = message.attachments.array();

					images.forEach((image) => {
						download(image.url, image.filename, () => {
							console.log("Done");
							require("simple-git")("./Memes_DUT_info/")
								.add(image.filename)
								.commit("image " + image.filename + " added")
								.push("origin", "master")
								.exec(() => {
									console.log(image.filename + " pushed");
								});
						});
					});
				});
			} else if (event.t === "MESSAGE_REACTION_REMOVE") {
				//TODO: maybe delete file from git
			}
		}
	}
});

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
	try {
		let name = newUserChannel.name + "-" + config.profs[Math.floor(Math.random() * config.profs.length)];

		newMember.guild.createChannel(name, { type: "voice", parent: newUserChannel.parentID }).then((channel) => {
			console.log("created channel ".green + "'" + colors.cyan(name) + "'");
			newMember
				.setVoiceChannel(channel)
				.then(() =>
					console.log(
						"moved ".yellow +
							"'" +
							colors.blue(newMember.displayName) +
							"'" +
							" in ".yellow +
							"'" +
							colors.cyan(name) +
							"'"
					)
				)
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
		.then(console.log("deleted channel ".red + "'" + colors.cyan(oldUserChannel.name) + "'"))
		.catch((err) => console.log(err));
}

// exit the program is the user hits ctrl+c
process.on("SIGINT", () => {
	bot
		.destroy()
		.then(console.log("Good bye".rainbow.bold.underline))
		.catch((err) => console.log(err));
	process.exit();
});

// on message
bot.on("message", (message) => {
	if (
		message.content.toLowerCase().startsWith("!chaussure") &&
		message.member.roles.some((r) => ["ADMIN CHAUSSURE"].includes(r.name))
	) {
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
	member
		.addRoles(config.roles)
		.then(
			console.log("added roles ".green + "'DJ' and 'apprenti CHAUSSURE' to '" + colors.blue(member.displayName) + "'")
		)
		.catch((err) => console.log(err));
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
		if (
			!config.channels.includes(oldUserChannel.name) &&
			oldUserChannel.members.size === 0 &&
			!config.blackList.includes(oldUserChannel.name)
		) {
			deleteChannel(oldUserChannel);
		}
	} else if (oldUserChannel !== undefined && newUserChannel !== undefined) {
		// User moved channel
		if (
			!config.channels.includes(oldUserChannel.name) &&
			oldUserChannel.members.size === 0 &&
			!config.blackList.includes(oldUserChannel.name)
		) {
			deleteChannel(oldUserChannel);
		}

		if (config.channels.includes(newUserChannel.name) && !config.blackList.includes(newUserChannel.name)) {
			createNewChannel(newMember, newUserChannel);
		}
	}
});
