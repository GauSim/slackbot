
import moment = require('moment-timezone');
import { Repository } from "./env/Repository";
import { SocketConnector, ApplicationSocketEvent } from "./models/SocketConnector";

const down = new Map<string, { time: moment.Moment }>([]);

const toHash = (it$: ApplicationSocketEvent) => "´" + it$.env.app.appShortName + " " + ` | ${it$.env.env[0]}`;

const wentOffline = (hash: string, _: ApplicationSocketEvent) => {
  down.set(hash, { time: moment(new Date()) });
  return `[${hash}] just went down ...`;
}


const wentOnline = (hash: string, _: ApplicationSocketEvent) => {
  const { time } = down.get(hash) || { time: undefined };
  down.delete(hash);
  return `[${hash}] seems to be online again ${time ? ', was offline for ' + (moment.duration(time.diff(new Date())).asSeconds() * -1) + 'sec.' : ''}  ...`;
};

export class EnvironmentWatcher {

  public static getEventStream() {

    return Repository.filter(({ env, app }) => ['FACADE'].indexOf(app.appShortName) !== -1 && !!env) // todo backends 'WEBAPP_EMBBEDDED'
      .map(it => SocketConnector.getStream(it))
      .reduce((all$, current$) => all$.merge(current$))
      .map(it => {
        const hash = toHash(it);
        return {
          ...it,
          msg: it.type === 'ERROR'
            ? down.has(hash) ? undefined : wentOffline(hash, it)
            : down.has(hash) ? wentOnline(hash, it) : undefined
        }
      })
      .filter(it => !!it.msg);
  }

}
