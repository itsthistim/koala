const { Listener } = require('@sapphire/framework');

module.exports = class ReadyListener extends Listener {
  constructor(context, options = {}) {
    super(context, {
      ...options,
      event: "messageCreate"
    });
  }

  async run(message) {
    
    // if a message was sent in server 502208815937224715 and contains the word 'bread', react with 🍞
    if (message.guild.id === '1005574058781462648' && message.content.includes('bread')) {
      message.react('🍞');
    }
  }
}