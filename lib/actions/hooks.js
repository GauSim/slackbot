
const BaseStorage = require('../Storage/BaseStorage');
const PartialStore = require('../Storage/PartialStore');
const crypto = require('crypto');
const config = require('../config').default;

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

function createBuildResultsUrl(relativUrl) {
  if (!relativUrl || !config.buildServerBase) {
    return ''
  }

  relativUrl = relativUrl[0] === '/' ? relativUrl : '/' + relativUrl;
  return `${config.buildServerBase}${relativUrl}`;
}


/* usage example:
curl "http://core-slackbot.herokuapp.com/hooks/gasi/df9e5ec3455f9dfe0480d83e8ace0caf548b302d036bc95bc4c6b1f74d8db802?msg=${bamboo.buildResultKey}&buildResultsUrl=${bamboo.buildResultsUrl}" 
*/
function webhookMiddleware(hookName, bots, req, res) {

  const inputMsg = req.query.msg;
  if (!inputMsg) { return res.status(404).json(null); };


  const buildResultsUrl = req.query.buildResultsUrl
    ? createBuildResultsUrl(req.query.buildResultsUrl)
    : null;
  console.log('buildResultsUrl', buildResultsUrl);

  const buildResult = req.query.buildResult
    && typeof req.query.buildResult === 'string'
    ? (req.query.buildResult.trim() === 'ok' ? true : false)
    : null;
  console.log('buildResult', buildResult);

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

          let buildResultMsg = '';
          if (buildResult !== null) {
            const resultIcon = buildResult ? ':large_blue_circle:' : ':red_circle:';
            const resultMsg = buildResult ? 'BUILD PASS' : 'BUILD FAILED';
            buildResultMsg = `${resultIcon}${resultIcon}${resultIcon} <${buildResultsUrl}|[${resultMsg}]>`;
          }

          const replyMessage = `${buildResultMsg} ${inputMsg} (<${buildResultsUrl}|details>) <${hookToUrl(match.name)}|ref>`;

          match.message.text = replyMessage;

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
        'hooks all'
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
          .catch(ex => bot.reply(message, JSON.stringify(ex)))
          .finally(() => baseStore.kill());
      }
    },
    {
      triggers: [
        'hooks clean all', 'hooks clear all'
      ],
      help: `remove all registerd hooks`,
      handler: (bot, message) => {
        bot.reply(message, `thinking on it ...`);

        const baseStore = new BaseStorage(process.env.REDIS_URL);
        const hookService = new WebhookService(baseStore);

        hookService.clean()
          .then(msg => {
            bot.reply(message, 'done');
          })
          .then(() => hookService.getAll())
          .then(msg => {
            bot.reply(message, msg);
          })
          .catch(ex => bot.reply(message, JSON.stringify(ex)))
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
          .then(msg => {
            bot.reply(message, 'done');
          })
          .then(() => hookService.getAll())
          .then(msg => {
            bot.reply(message, msg);
          })
          .catch(ex => bot.reply(message, JSON.stringify(ex)))
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
          .then((hookName) => {
            bot.reply(message, `your hook is ready at ready: \n ` + hookToUrl(hookName));
          })
          .catch(ex => bot.reply(message, JSON.stringify(ex)))
          .finally(() => baseStore.kill());

      }
    }
  ]
}