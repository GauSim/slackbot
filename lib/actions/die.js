const { cleanRedis } = require('../Storage/utils');

module.exports = {
  action: {
    triggers: ['die', 'kill', '^stop'],
    help: 'I will kill my redis cache and kill my rtm connection, you will have to login in again',
    handler: (bot, message) => {

      cleanRedis(process.env.REDIS_URL)
        .then(e => {
          bot.reply(message, `redis clean:done \n closing connection \n Goodbye`);
          bot.rtm.close();
        }).catch(error => {
          bot.reply(message, `error:${JSON.stringify(error)}`);
        });
    }
  }
}
