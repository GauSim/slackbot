require('dotenv').config();
const Botkit = require('botkit');
import Storage = require('./lib/Storage');
import { registerActions } from './lib/actions';
import { keepAlive } from './helper/heroku';
import { webhookMiddleware } from './lib/actions/hooks';
import { EnvironmentWatcher } from "./lib/EnvironmentWatcher";
import config from './lib/config';


if (!process.env.token) {
  throw new Error('missing [process.env.token]');
}

const controller = Botkit.slackbot({
  debug: config.isDevelopmentMode
  // storage: Storage(process.env.REDIS_URL)
});

const bot = controller.spawn({
  token: process.env.token
}).startRTM();


controller.on('rtm_open', bot => {
  console.log('** The RTM api just connected!');
  if (config.isDevelopmentMode) {
    return;
  }
});

controller.on('rtm_close', bot => {
  console.log('** The RTM api just closed');
  bot.say(
    {
      text: 'cu',
      channel: '#fsm_build_server'
    }
  );
});

/*
interface ISlackChannel { id: string, name: string, num_members: number, is_member:boolean }
bot.api.channels.list({}, (err, response: { ok: boolean, channels: ISlackChannel[] }) => {
  console.log('################', response.channels.filter(it =>it.num_members > 15 && it.is_member))
})
*/

// register all actions
registerActions(controller);
