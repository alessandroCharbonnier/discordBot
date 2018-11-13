const colors = require('colors');
const Discord = require('discord.js');
const bot = new Discord.Client();

//loading config file
const config = require('./config.json');

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
  try {
    let name = newUserChannel.name + '-' + config.profs[Math.floor(Math.random() * config.profs.length)];

    newMember.guild.createChannel(name, {type : 'voice' , parent : newUserChannel.parentID}).then((channel) => {
      console.log('created channel '.green + '\''+ colors.cyan(name) + '\'');
      newMember.setVoiceChannel(channel);
      console.log('moved '.yellow + '\'' + colors.blue(newMember.displayName) + '\'' + ' in '.yellow + '\'' + colors.cyan(name) + '\'');
    });
  } catch (err) {
    console.error(err);
  }
}

// delete a voice channel
function deleteChannel(oldUserChannel) {
  oldUserChannel.delete()
    .then(console.log('deleted channel '.red + '\'' + colors.cyan(oldUserChannel.name) + '\''))
    .catch(err => console.log(err));
}

// properlly exit the program is the user hits ctrl+c
process.on('SIGINT', () => {
  bot.destroy()
    .then(console.log('Good bye'.rainbow.bold.underline))
    .catch(err => console.log(err));
  process.exit();
});

// connect the bot
bot.login(config.token).catch(err => console.log(err));

// log that the bot is ready (optionnal)
bot.once('ready', () => {
  bot.user.setActivity("Fermez broser... Vite!");
  bot.users.get(config.owner).send('I am now online :wink:');
  console.log('Ready!'.rainbow.bold.underline);
});

// when a user join a channel the bot will add 2 config.roles (specific for every server)
bot.on('guildMemberAdd', member => {
  member.addconfig.roles(config.roles)
    .then(console.log('added config.roles '.green + '\'DJ\' and \'apprenti CHAUSSURE\' to \'' + colors.blue(member.displayName) + '\''))
    .catch(err => console.log(err));
});

// when a user join/quit/move channel
bot.on('voiceStateUpdate', (oldMember, newMember) => {
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
