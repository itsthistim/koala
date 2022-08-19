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

    if (breadguilds.includes(message.channel.guild.id)) {
      if (message.content.toLowerCase().includes('bread')) {
        message.react('🍞');
      }
      if (message.content.toLowerCase().includes('tim') || message.content.toLowerCase().includes('319183644331606016')) {
        message.react('🇼');
      }
    }
  }
}
