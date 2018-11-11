const Discord = require('discord.js');
const bot = new Discord.Client();

//loading config file
const { prefix, token, profs, channels, blackList } = require('./config.json');

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
  try {
    let name = newUserChannel.name + '-' + profs[Math.floor(Math.random() * profs.length)];

    newMember.guild.createChannel(name, 'voice').then((cc, tc, vc) => {
      cc.setParent(newUserChannel.parentID);
      console.log('created channel \'' + name + '\'');
      newMember.setVoiceChannel(cc);
      console.log('moved \'' + newMember.displayName + '\'');
      
    });
  } catch (err) { 
    console.error(err);
  }
}

// properlly exit the program is the user hits ctrl+c
process.on('SIGINT', () => {
  bot.destroy()
    .then(console.log('Good bye'))
    .catch(err => console.log(err));
  process.exit();
});

// connect the bot
bot.login(token).catch(err => console.log(err));

// log that the bot is ready (optionnal)
bot.once('ready', () => console.log('Ready!'));

// when a user join a channel the bot will add 2 roles (specific for every server)
bot.on('guildMemberAdd', member => {
  member.addRoles(['499314917711675393', '366669559341645856'])
    .then(console.log('added roles \'DJ\' and \'apprenti CHAUSSURE\' to \'' + member.displayName + '\''))
    .catch(err => console.log(err));
});

// when a user join/quit/move channel
bot.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User Joins a voice channel
    if (channels.includes(newUserChannel.name) && !blackList.includes(newUserChannel.name)) {
      createNewChannel(newMember, newUserChannel);
    }
  } else if (newUserChannel === undefined) {
    // User leaves a voice channel
      if (!channels.includes(oldUserChannel.name) && oldUserChannel.members.size === 0 && !blackList.includes(oldUserChannel.name)) {
        oldUserChannel.delete()
          .then(console.log('deleted \'' + oldUserChannel.name + '\''))
          .catch(err => console.log(err));
      }
  } else if (oldUserChannel !== undefined && newUserChannel !== undefined) {
    // User moved channel
      if (!channels.includes(oldUserChannel.name) && oldUserChannel.members.size === 0 && !blackList.includes(oldUserChannel.name)) {
        oldUserChannel.delete()
          .then(console.log('deleted \'' + oldUserChannel.name + '\''))
          .catch(err => console.log(err));
      }

    if (channels.includes(newUserChannel.name) && !blackList.includes(newUserChannel.name)) {
      createNewChannel(newMember, newUserChannel);
    }
  }
});