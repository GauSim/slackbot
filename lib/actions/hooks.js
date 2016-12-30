
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
      return hookList.length > 0 ? 'hooks:\n' + hookList.map(hook => hook.name).join('\n') : 'no hooks found';
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




const test = (baseStore) => {
  const hookService = new WebhookService(baseStore);

  const name = 'test_hook';

  return hookService.addHook(name).then(() => {
    return hookService.getAll();
  });
  // return hookService.clean();

  /*  return hookService.addHook().then(e => {
  
      return hookService.hooks.all()
        .then(() => {
          
        });
  
    });
  */

  /*
    return hookService.hooks.keys()
      .then(list => {
        const body = 'hooks=' + JSON.stringify(list, null, 2);
        return body;
      });
  */

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
  test: test,
  webhookMiddleware: webhookMiddleware,
  actions: [
    {
      triggers: [
        'hooks all'
      ],
      help: `lists hooks`,
      handler: (bot, message) => {

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
        'hooks clean all'
      ],
      help: `remove all registerd hooks`,
      handler: (bot, message) => {

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
        'hooks remove'
      ],
      help: "add a webhook with ```hooks remove [hook-name-here]```",
      handler: (bot, message) => {

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
        'hooks add'
      ],
      help: "add a webhook with ```hooks add [hook-name-here]```",
      handler: (bot, message) => {

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const hookService = new WebhookService(baseStore);

        const hookName = hookService.createHookName('hook' + Date.now().toString());
        bot.reply(message, `ok, adding hook ...`);
        hookService.addHook(hookName, message)
          .then(() => {
            bot.reply(message, `hook ready: \n ${process.env.pingURL}/hooks/${hookName}`);
          })
          .finally(() => baseStore.kill());

      }
    }
  ]
}