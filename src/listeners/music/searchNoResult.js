const { Listener } = require('@sapphire/framework');

module.exports = class SearchNoResultListener extends Listener {
    constructor(context) {
        super(context, {
            event: "searchNoResult",
            emitter: "distube"
        });
    }

    async run(message, query) {
        message.channel.send({
            embeds: [{
                title: `No Result`,
                description: `Couldn't find a result for \`${query.slice(0, 1974)}\`.`,
                color: COLORS.RED
            }]
        })
    }
}