import request = require('request-promise-native');
import _ = require('lodash');
import moment = require('moment-timezone');

import * as fun from './fun';
import { Format } from '../Format';
import { Repository } from '../env/Repository';
import { Maybe } from '../models/Maybe';
import { Environment, IEnvResponse, httpMiddleWare } from '../models/Environment';
import { IMessage } from '../models/IMessage';
import { IBot } from '../models/IBot';
import { EnvMapItem } from '../models/Application';


const removeMatch = (message: IMessage): string => message.text
    .replace(message.match[0], '')
    .trim()
    .toUpperCase();

class WhatsOnline {

    _get: httpMiddleWare;

    constructor(
        _request: (o: any) => Promise<string>,
        private _format: Format,
        private doNotThrow = true) {

        this._get = (opt: Maybe<{ url: string }>) => {
            if (!opt) {
                return Promise.reject(new Error('missing reqest options'))
            }
            const start = moment(new Date());
            console.log(`GET | ${opt.url}`);
            return (_request)(Object.assign(opt, { timeout: 12000 }))
                .then(response => {
                    console.log(`DONE [${(moment.duration(start.diff(new Date())).asSeconds() * -1)}] | ${opt.url}`);
                    return response;
                });
        }
    }

    private catchError(error: Error | string, { env, app }: Environment): IEnvResponse {
        const [envName, url] = env as EnvMapItem;
        if (this.doNotThrow) {
            console.log({ error, envName, app: app.appShortName, url });
            return {
                env,
                appShortName: app.appShortName,
                versions: [],
                lastCommits: [],
                githubRepoUrl: null,
                buildTimestamps: [],
                deployedTimestamp: null,
                resultLine: ("`" + envName + "`") + ` | <${url}|${app.appShortName}> → *looks offline* (${error instanceof Error ? error.message : ''})`,
                hasError: true,
                diffingHash: `${Date.now()}-${app.appShortName}-${envName}`
            }
        } else {
            throw error instanceof Error ? error : new Error(error);
        }
    }

    getWork(toCheck: string[] = []): Promise<IEnvResponse>[] {
        return Repository
            .filter(({ env, app }) => {
                const [envName] = env;
                return toCheck.length === 0
                    || !!envName && toCheck.map(e => e.toLowerCase()).indexOf(envName.toLowerCase()) > -1 // by envName
                    || toCheck.map(e => e.toLowerCase()).indexOf(app.appShortName.toLowerCase()) > -1 // by appName
            })
            .map(it => it.getStatus(this._get, this._format)
                .catch(error => this.catchError(error, it)));
    }

    check(work: Promise<IEnvResponse>[]): Promise<string> {
        const start = moment(new Date());
        return Promise.all(work)
            .then(results => _(results).sortBy(it => it.appShortName).map(it => it.resultLine).join('\n'))
            .then(msg => `${msg}\n i'm done, all dates are in UTC+0, i did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }

}

const actions = [
    {
        triggers: [
            'version ',
            'v '
        ],
        help: `i will check each env/app and tell you what version is deployed, you can also check for a specific env => ${Repository.matchEnvOrApp().map(e => "`" + e + "`").join(', ')}`,
        handler: (bot: IBot, message: IMessage) => {


            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const whatsOnline = new WhatsOnline(request as any, new Format());
            const toCheck = Repository.matchEnvOrApp(removeMatch(message));
            if (!toCheck.length) {
                bot.reply(message, `mhm? unknown... \n try ${Repository.matchEnvOrApp().map(e => "`" + e + "`").join(', ')}`);
                return;
            }

            const work = whatsOnline.getWork(toCheck);

            bot.reply(message, `i'll check ${toCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

            whatsOnline.check(work)
                .then(replyText => bot.reply(message, replyText))
                .catch(error => {
                    console.error(error);
                    bot.reply(message, `something went wront... ${JSON.stringify(error)}`);
                });
        }
    },
    {
        triggers: [
            'diff ',
            'd '
        ],
        help: `ill try to get a diff of the env/app's like ${Repository.matchEnvOrApp().map(e => "`" + e + "`").join(', ')}`,
        handler: (bot: IBot, message: IMessage) => {

            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const whatsOnline = new WhatsOnline(request as any, new Format());

            const toCheck = Repository.matchEnvOrApp(removeMatch(message));
            if (!toCheck.length) {
                bot.reply(message, `mhm? unknown... \n try ${Repository.matchEnvOrApp().map(e => "`" + e + "`").join(', ')}`);
                return;
            }

            const work = whatsOnline.getWork(toCheck);

            bot.reply(message, `diff'ing ${toCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

            Promise.all(work)
                .then(results => {
                    const grpByAppHash = _.chain(results)
                        .filter(it => !!it.versions.join(',') && !it.hasError) // dont show errors
                        .groupBy(it => it.diffingHash);


                    // do a better full diff!
                    const allAreTheSame = false
                    /*&& grpByAppHash
                        .keys()
                        .value().length ===
                        [
                            ...Object.keys(FRONTEND_APPS),
                            ENV_NAME_FACADE,
                            ENV_NAME_DATA_CLOUD,
                            ENV_NAME_MASTER_CLOUD,
                            ENV_NAME_ADMIN,
                        ].length;
                        */

                    return allAreTheSame
                        ? '... looks the same to me →' + toCheck.map(it => '`' + it + '`').join(' == ')
                        : (grpByAppHash as any)
                            .map((list: IEnvResponse[]) => {
                                const versionStr = list[0].lastCommits && list[0].lastCommits.length
                                    ? `${list[0].versions.join(',')} ${list[0].lastCommits.map(it => new Format().commit(list[0].githubRepoUrl, it)).join(',')}`
                                    : list[0].versions.join(',')

                                return '`' + list[0].appShortName + '`' + ` | *${versionStr}* → ` + list.map(it => '`' + it.env[0] + '`').join(' == ');
                            })
                            .sort()
                            .join('\n')
                            .value()
                })
                .then(replyText => {
                    bot.reply(message, replyText);
                })
                .catch(error => {
                    console.error(error);
                    bot.reply(message, `something went wront... ${JSON.stringify(error)}`);
                });

        }
    }
];

export {
    actions
}
