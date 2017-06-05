import request = require('request-promise-native');
import _ = require('lodash');
import moment = require('moment-timezone');

import * as fun from './fun';
import { Format } from '../Format';
import { Repository } from '../env/Repository';
import { Maybe } from '../models/Maybe';
import { Environment, IEnvResponse, httpMiddleWare, EnvName } from '../models/Environment';

interface IMessage { text: string, match: [string] };

const NO_VERSION_NUMBER_FOUND = 'no version number found';

const removeMatch = (message: IMessage): EnvName => message.text
    .replace(message.match[0], '')
    .trim()
    .toUpperCase();


class WhatsOnline {

    _get: httpMiddleWare;

    constructor(
        _request: any,
        private _format: Format,
        private doNotThrow = true) {

        this._get = (opt: Maybe<{ url: string }>) => {
            if (!opt) {
                return Promise.reject(new Error('missing reqest options'))
            }
            console.log(`GET | ${opt.url}`);
            return (_request as (o) => Promise<string>)(opt)
                .then(response => {
                    console.log(`DONE | ${opt.url}`);
                    return response;
                });
        }
    }

    private catchError(error: Error | string, envInst: Environment): IEnvResponse {
        const appShortName = envInst.app.appShortName;
        const env = envInst.env;
        const versionInfo = envInst.app.getVersionInfo(env);

        if (this.doNotThrow) {
            console.log({ error, env: envInst.env, appShortName });
            return {
                env: envInst.env,
                appShortName,
                version: null,
                lastCommit: null,
                githubRepoUrl: null,
                buildTimestamp: null,
                deployedTimestamp: null,
                lastModifiedTimestamp: null,
                resultLine: ("`" + env + "`") + ` | <${versionInfo ? versionInfo.url : ''}|${appShortName}> → looks offline`,
                hasError: true
            }
        } else {
            throw error instanceof Error ? error : new Error(error);
        }
    }

    getWork(toCheck: string[] = []): Promise<IEnvResponse>[] {
        return Repository.filter((env: string) => toCheck.length === 0 || toCheck.map(e => e.toLowerCase()).indexOf(env.toLowerCase()) > -1)
            .map(it => it.getStatus(this._get, this._format)
                .catch(error => this.catchError(error, it)));
    }

    check(work: Promise<IEnvResponse>[]): Promise<string> {
        const start = moment(new Date())
        return Promise.all(work)
            .then(results => _.sortBy(results, it => it.appShortName).map(it => it.resultLine).join('\n'))
            .then(msg => `${msg}\n i'm done, all dates are in UTC+0, i did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }




}

const actions = [
    {
        triggers: [
            'version ',
            'v '
        ],
        help: `i will check each environment and tell you what version is deployed, you can also check for a specific env => ${Repository.getEnvs().map(e => "`" + e + "`").join(', ')}`,
        handler: (bot, message: IMessage) => {


            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const whatsOnline = new WhatsOnline(request, new Format());
            const toCheck = Repository.getEnvs(removeMatch(message));
            if (!toCheck.length) {
                bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${Repository.getEnvs().map(e => "`" + e + "`").join(', ')}`);
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
        help: `ill try to get a diff of the env's`,
        handler: (bot, message: IMessage) => {

            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const whatsOnline = new WhatsOnline(request, new Format());

            const toCheck = Repository.getEnvs(removeMatch(message));
            if (!toCheck.length) {
                bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${Repository.getEnvs().map(e => "`" + e + "`").join(', ')}`);
                return;
            }

            const work = whatsOnline.getWork(toCheck);

            bot.reply(message, `diff'ing ${toCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

            Promise.all(work)
                .then(results => {
                    const grpByAppHash = _.chain(results)
                        .filter(it => !!it.version && !it.hasError)
                        .groupBy(it => `${it.appShortName} ${it.version}`); // diffing by version string 


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
                                const versionStr = list[0].lastCommit
                                    ? list[0].version + '' + new Format().commit(list[0].githubRepoUrl, list[0].lastCommit)
                                    : list[0].version

                                return `${list[0].appShortName} | ${versionStr} → ` + list.map(it => '`' + it.env + '`').join(' == ');
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
