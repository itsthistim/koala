const { Listener } = require('@sapphire/framework');

module.exports = class ReadyListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      event: "messageCreate"
    });
  }

  async run(message) {
    
    const breadguilds = ['502208815937224715', '1005574058781462648']

    // if a message was sent in one of the breadguilds, and contains the word 'bread' to lowercase, react with 🍞
    if (breadguilds.includes(message.channel.guild.id) && message.content.toLowerCase().includes('bread')) {
      message.react('🍞');
    }
  }
}