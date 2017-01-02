
const BaseStorage = require('../Storage/BaseStorage');
const PartialStore = require('../Storage/PartialStore');
const crypto = require('crypto');


class WebhookService {
  constructor(baseStore) {
    this.subscriptions = new PartialStore(baseStore, 'subscriptions');
    this.hooks = new PartialStore(baseStore, 'hooks');
  }

  add() {
    const subName = 'testsubscription';
    const subData = { random: 'data' };

    return this.subscriptions.save(subName, subData);
  }

  addHook(name, message) {

    const hook = {
      name,
      message
    }

    return this.hooks.save(name, hook);
  }

  removeHook(name) {
    return this.hooks.delete(name);
  }

  createHookName(name) {
    const secret = 'server-secret'; // doto read from process 
    return crypto.createHmac('sha256', secret)
      .update(name)
      .digest('hex')
  }

  getAll() {
    return this.hooks.all().then(hookList => {
      return hookList.length > 0 ? `found ${hookList.length} hooks:\n` + hookList.map(hook => hookToUrl(hook.name)).join('\n') : 'no hooks found';
    });
  }

  clean() {
    return this.hooks.keys()
      .then(listOfKeys => {
        console.log('hook:keys', listOfKeys);
        // delete all hooks 
        const work = listOfKeys.map(key => this.hooks.delete(key).then(() => { console.log('hooks.delete', key) }))
        return Promise.all(work);
      })
      .then(() => {
        return this.subscriptions.keys()
          .then(listOfKeys => {
            console.log('subscriptions:keys', listOfKeys);
            // delete all subscriptions 
            const work = listOfKeys.map(key => this.subscriptions.delete(key).then(() => { console.log('hooks.delete', key) }))
            return Promise.all(work);
          })
      });
  }
}

function hookToUrl(hookName) {
  return `${process.env.pingURL}/hooks/${hookName}`;
}

function webhookMiddleware(hookName, bots, req, res) {

  const baseStore = new BaseStorage(process.env.REDIS_URL);
  const hookService = new WebhookService(baseStore);

  hookService.hooks.matchKey(hookName)
    .then(results => {
      const [match] = results;
      if (!match)
        throw (`${hookName} not found`);
      return match;
    })
    .then(match => hookService.hooks.get(match))
    .then(match => {

      Object.keys(bots).forEach(key => {
        const bot = bots[key];
        // find matching team
        if (match.message.team === bot.team_info.id) {

          match.message.text = "`hook triggerd`";
          bot.say(match.message);

        }
      });
      res.send('OK');
    })
    .catch(error => {
      console.error(error);
      res.status(404).json(error);
    })
    .finally(() => baseStore.kill());

}

module.exports = {
  webhookMiddleware: webhookMiddleware,
  actions: [
    {
      triggers: [
        'hooks', 'hooks all'
      ],
      help: `lists hooks`,
      handler: (bot, message) => {
        bot.reply(message, `thinking ...`);

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const hookService = new WebhookService(baseStore);

        hookService.getAll()
          .then(msg => {
            bot.reply(message, msg);
          })
          .finally(() => baseStore.kill());
      }
    },
    {
      triggers: [
        'hooks clean all', 'hooks clear all'
      ],
      help: `remove all registerd hooks`,
      handler: (bot, message) => {
        bot.reply(message, `thinking ...`);

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const hookService = new WebhookService(baseStore);

        hookService.clean()
          .then(() => hookService.getAll())
          .then(msg => {
            bot.reply(message, msg);
          })
          .finally(() => baseStore.kill());
      }
    },
    {
      triggers: [
        'hooks remove', 'hooks delete'
      ],
      help: "remove a hook like: hooks remove [hook-name-here]",
      handler: (bot, message) => {
        bot.reply(message, `ok, removing hook ...`);

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const hookService = new WebhookService(baseStore);
        const hookName = message.text.replace('hooks remove', '').trim();

        hookService.removeHook(hookName)
          .then(() => hookService.getAll())
          .then(msg => {
            bot.reply(message, msg);
          })
          .finally(() => baseStore.kill());
      }
    },
    {
      triggers: [
        'hooks add', 'hooks create'
      ],
      help: "add a webhook to this channel, conversation",
      handler: (bot, message) => {
        bot.reply(message, `ok, adding hook ...`);

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const userStore = new PartialStore(baseStore, 'users');



        userStore.get(message.user)
          .then(userInfo => {
            const hookService = new WebhookService(baseStore);
            const hookName = userInfo.user + '/' + hookService.createHookName(userInfo.user + Date.now().toString());
            return hookService.addHook(hookName, message)
              .then(() => hookName);
          })
          .catch(ex => {
            console.error(ex);
          })
          .then((hookName) => {
            bot.reply(message, `your hook is ready at ready: \n ` + hookToUrl(hookName));
          })
          .finally(() => baseStore.kill());

      }
    }
  ]
}