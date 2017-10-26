
import moment = require('moment-timezone');
import { Repository } from "./lib/env/Repository";
import { RealTime, ApplicationSocketEvent } from "./lib/models/RealTime";
import { Observable } from "rxjs/Observable";

const down = new Map<string, { time: moment.Moment }>([]);

const toHash = (it$: ApplicationSocketEvent) => `${it$.env.app.appShortName}|${it$.env.env[0]}`;

const wentOffline = (hash: string, it: ApplicationSocketEvent) => {
  down.set(hash, { time: moment(new Date()) });
  return `[${hash}] just went down ...`;
}

const stillOffline = (hash: string, it: ApplicationSocketEvent) => {
  return `[${hash}] is still offline ...`;
}

const wentOnline = (hash: string, it: ApplicationSocketEvent) => {
  const { time } = down.get(hash) || { time: undefined };
  down.delete(hash);
  return `[${hash}] seems to be online again ${time ? ', was offline for ' + (moment.duration(time.diff(new Date())).asSeconds() * -1) + 'sec.' : ''}  ...`;
};

export const stream$ = Repository.filter(({ env, app }) => ['FACADE'].indexOf(app.type) !== -1) // , 'WEBAPP_EMBBEDDED' // todo
  .map(it => RealTime.getStream(it))
  .reduce((all$, current$) => all$.merge(current$))
  .map(it => {
    const hash = toHash(it);
    return {
      ...it,
      msg: it.type === 'ERROR'
        ? down.has(hash)
          ? stillOffline(hash, it)
          : wentOffline(hash, it)
        : down.has(hash)
          ? wentOnline(hash, it)
          : undefined
    }
  })
  .filter(it => !!it.msg)
//.forEach(it => console.log(it.msg))


console.log('runnig');