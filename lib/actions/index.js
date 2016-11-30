const whatsOnline = require('./whats-online');

const actions = [
    require('./whats-online'),
    require('./die'),
    {
        triggers: ['say hello', 'hello'],
        help: 'I will say hello :)',
        handler: (bot, message) => bot.reply(message, 'Hello!')
    },
    {
        triggers: ["who's your daddy", 'daddy'],
        handler: (bot, message) => bot.reply(message, `I was created by Simon Gausmann, he is a pretty cool guy... \n\n Maybe you want to add some stuff aswell? \n check out https://github.com/GauSim/slackbot`)
    }
]



const registerActions = (controller) => {

    actions.forEach(action => {
        controller.hears(action.triggers, ['direct_message', 'mention', 'direct_mention'], action.handler);
    });


    controller.hears(['help', 'info'], ['direct_message', 'mention', 'direct_mention'], (bot, message) => {

        // build help string
        const helpStringForEachAction = actions.map(action =>
            `${action.triggers.map(e => '`' + e + '`').join(', ')} => ${action.help ? action.help : `it does something, but i don't know what `}`
        );

        const text = `commands i know: \n ${helpStringForEachAction.join('\n')}`;

        bot.reply(message, text);
    });

    controller.on(['direct_message', 'mention', 'direct_mention'], function(bot, message) {
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'robot_face',
        }, function(err) {
            if (err) { console.log(err) }
            bot.reply(message, 'I heard you loud and clear boss.');
        });
    });

}


module.exports = {
    registerActions: registerActions
}

