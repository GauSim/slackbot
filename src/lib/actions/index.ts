import _ = require('underscore');
import * as fun from './fun';
import { actions as hookActions } from './hooks';
import { actions as whatsOnlineActions } from './whats-online';


const actions = [
    ...whatsOnlineActions,
    ...hookActions,
    {
        triggers: ['say hello', 'hello'],
        help: 'I will say hello :)',
        handler: (bot, message) => bot.reply(message, 'Hello!')
    },
    {
        triggers: ["who's your daddy", 'daddy'],
        handler: (bot, message) => bot.reply(message, `I was created by Simon Gausmann, he is a pretty cool guy... \n\n Maybe you want to add some stuff aswell? \n check out https://github.com/GauSim/slackbot`)
    }
] as { triggers: string[], help: string; handler: (bot, message) => void; }[];


export function registerActions(controller) {

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

    controller.on(['direct_message', 'mention', 'direct_mention'], function (bot, message) {
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'robot_face',
        }, function (err) {

            if (err) { console.log(err) }
            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));
        });
    });

}
