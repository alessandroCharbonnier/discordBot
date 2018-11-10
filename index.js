const Discord = require('discord.js');
const bot = new Discord.Client();

//loading config file
const { prefix, token } = require('./config.json');

// array of nouns used to generate new channels
const profs = ['Patoch', 'MHR', 'Pierre', 'Denis',
               'Annabelle', 'Luc', 'Florent', 'Didier',
               'Selma', 'Zina', 'Patricia', 'Oleg', 'Jeremy',
               'Sandrine', 'Regis', 'Anne-Gaelle', 'Miembro',
               'Regine', 'Jaen-Francois', 'Bibone', 'Frederic',
               'A-preciser', 'Fabrice'];

// channels that will be affected by the bot
const channels = ['CHAUSSURE', 'e-sport', 'programmation'];

// channels that are ignored
const blackList = ['CHASSE LE CARIBOU'];

// create a new channel with the noun of the parent category with a random name and place that channel in the appropriate category
function createNewChannel(newMember, newUserChannel) {
  try {
    let name = newUserChannel.name + '-' + profs[Math.floor(Math.random() * profs.length)];

    newMember.guild.createChannel(name, 'voice').then((cc, tc, vc) => {
      cc.setParent(newUserChannel.parentID);
      newMember.setVoiceChannel(cc);
    });
  } catch (e) { }
}

// properlly exit the program is the user hits ctrl+c
process.on('SIGINT', () => {
    console.log('Good bye!');
    bot.destroy();
    process.exit();
});

// connect the bot
bot.login(token);

// log that the bot is ready (optionnal)
bot.once('ready', () => {
    console.log('Ready!');
});

// when a user join a channel the bot will add 2 roles (specific for every server)
bot.on('guildMemberAdd', member => {
    member.addRoles(['499314917711675393', '366669559341645856']);
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
			if (!channels.includes(oldUserChannel.name) && oldUserChannel.members.array.length === 0 && !blackList.includes(oldUserChannel.name)) {
        oldUserChannel.delete();				
      }
    } else if (oldUserChannel !== undefined && newUserChannel !== undefined) {
			// User moved channel
			if (oldUserChannel.members.array.length === 0 && !channels.includes(oldUserChannel.name) && !blackList.includes(oldUserChannel.name)) {
				oldUserChannel.delete();				
      }
      
			if (channels.includes(newUserChannel.name) && !blackList.includes(newUserChannel.name)) {
			  createNewChannel(newMember, newUserChannel);
			}
		}
});