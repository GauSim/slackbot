import request = require('request-promise-native');
import _ = require('underscore');
import moment = require('moment-timezone');

import * as fun from './fun';
import { Format, IEnvResponse } from '../Format';
import { Repository, IEnv } from '../env/Repository';

const NO_VERSION_NUMBER_FOUND = 'no version number found';


class WhatsOnline {

    get: (opt: { url: string, headers?: { [h: string]: string } }) => Promise<string>;

    constructor(
        _request: any,
        private format: Format,
        private doNotThrow = true) {

        this.get = (opt: { url: string }) => {
            console.log(`GET | ${opt.url}`);


            return (_request as (o) => Promise<string>)(opt)
                .then(response => {
                    console.log(`DONE | ${opt.url}`);
                    return response;
                });
        }
    }

    private catchError(error: Error | string, env: string, appShortName: string, versionInfo: { url: string }): IEnvResponse {
        if (this.doNotThrow) {
            console.log({ error, env, appShortName, });
            return {
                env,
                appShortName,
                versionInfo,
                version: null,
                lastCommit: null,
                buildTimestamp: null,
                deployedTimestamp: null,
                lastModifiedTimestamp: null,
                resultLine: ("`" + env + "`") + ` | <${versionInfo.url}|${appShortName}> → looks offline`,
                hasError: true
            }
        } else {
            throw error instanceof Error ? error : new Error(error);
        }
    }

    fromWebapp({ env, appShortName, versionInfo, deploymentInfo }: IEnv) {

        const noStamp = { timestamp: null };
        const asyncDeploymentInfo: Promise<{ timestamp: null | string }> = deploymentInfo
            ? this.get(deploymentInfo)
                .then(jsonString => JSON.parse(jsonString))
                .catch(e => noStamp) // catch 404, and redirects etc.
            : Promise.resolve(noStamp)

        return Promise
            .all([
                this.get(versionInfo),
                asyncDeploymentInfo
            ])
            .then(([versionFile, { timestamp }]) => {

                const json = JSON.parse(versionFile) as { lastCommit: string; buildTimestamp: string; appConfig: { version: string; } };

                return this.format.mixinResultLine({
                    env,
                    appShortName,
                    versionInfo,
                    version: json.appConfig.version,
                    lastCommit: json.lastCommit,
                    buildTimestamp: json.buildTimestamp,
                    deployedTimestamp: timestamp,
                    lastModifiedTimestamp: null, // headers["last-modified"],
                });
            })
            .catch(error => this.catchError(error, env, appShortName, versionInfo));
    }

    fromCloud({ env, appShortName, versionInfo, deploymentInfo }: IEnv) {
        return this.get(versionInfo)
            .then(rawBody => {

                let version = null as null | string;
                const exp = new RegExp(/([0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]?[0-9]?)/);
                if (exp.test(rawBody)) {
                    const matches = exp.exec(rawBody);
                    version = matches && matches[0] ? matches[0] : version;
                }


                let buildTimestamp = null as null | moment.Moment;
                if (version) {
                    buildTimestamp = moment(
                        rawBody
                            .toLowerCase()
                            .replace(`${appShortName}-${version}`.toLowerCase(), '')
                            .replace('(', '')
                            .replace(')', '')
                            .toUpperCase(),
                        moment.ISO_8601)
                        .utc();
                }

                return this.format.mixinResultLine({
                    env,
                    appShortName,
                    versionInfo,
                    version: version,
                    lastCommit: null,
                    buildTimestamp: buildTimestamp,
                    deployedTimestamp: null,
                    lastModifiedTimestamp: null,
                });
            })
            .catch(error => this.catchError(error, env, appShortName, versionInfo));
    }

    fromFacade({ env, appShortName, versionInfo, deploymentInfo }: IEnv) {
        return this.get(versionInfo)
            .then(rawBody => {

                const json = JSON.parse(rawBody) as { lastCommit: string; buildTimestamp: string; deployTimestamp: string, version: string };

                return this.format.mixinResultLine({
                    env,
                    appShortName,
                    versionInfo,
                    version: json.version,
                    lastCommit: json.lastCommit,
                    buildTimestamp: json.buildTimestamp,
                    deployedTimestamp: json.deployTimestamp,
                    lastModifiedTimestamp: null,
                });
            })
            .catch(error => this.catchError(error, env, appShortName, versionInfo));
    }

    fromHockeyApp({ env, appShortName, versionInfo, deploymentInfo }: IEnv) {
        // X-HockeyAppToken: eeec0fba65114c61aeb14afb46f42522" 
        return this.get(versionInfo)
            .then(rawBody => {

                const json = JSON.parse(rawBody) as {
                    app_versions: {
                        download_url: string;
                        shortversion: string;
                        updated_at: string;
                        notes: string;
                    }[], status: 'success'
                };

                const it = json.app_versions[0];

                let lastCommit = null as string | null;
                const exp = new RegExp(/\b([a-f0-9]{40})\b/);
                if (exp.test(it.notes)) {
                    const matches = exp.exec(it.notes);
                    lastCommit = matches && matches[0] ? matches[0] : lastCommit;
                }

                return this.format.mixinResultLine({
                    env,
                    appShortName,
                    lastCommit,
                    versionInfo: { url: it.download_url },
                    version: it.shortversion,
                    buildTimestamp: null,
                    deployedTimestamp: it.updated_at,
                    lastModifiedTimestamp: null,
                });
            })
            .catch(error => this.catchError(error, env, appShortName, versionInfo));
    }

    getUrls(envToCheck: string[] = []) {
        const envFilter = (env: string) => {
            return envToCheck.length === 0
                || envToCheck.map(e => e.toLowerCase()).indexOf(env.toLowerCase()) > -1;
        }

        return [
            ...Repository.webApps(envFilter)
                .map(it => this.fromWebapp(it)),

            ...Repository.dc(envFilter)
                .map(it => this.fromCloud(it)),

            ...Repository.mc(envFilter)
                .map(it => this.fromCloud(it)),

            ...Repository.admin(envFilter)
                .map(it => this.fromCloud(it)),

            ...Repository.ds(envFilter)
                .map(it => this.fromCloud(it)),

            ...Repository.facade(envFilter)
                .map(it => this.fromFacade(it)),

            ...Repository.android(envFilter)
                .map(it => this.fromHockeyApp(it))

        ] as Promise<IEnvResponse>[];
    }

    check(work: Promise<IEnvResponse>[]) {
        const start = moment(new Date());
        return Promise.all(work)
            .then(results => _.sortBy(results, it => it.appShortName).map(it => it.resultLine).join('\n'))
            .then(msg => `${msg}\n i'm done, all dates are in UTC+0, i did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }

}

const actions = [
    {
        triggers: [
            'version ',
            "what's online",
            'v '
        ],
        help: `i will check each environment and tell you what version is deployed, you can also check for a specific env => ${Repository.DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`,
        handler: (bot, message) => {


            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const envInputString = message.text
                .replace(message.match[0], '')
                .trim()
                .toUpperCase();

            let envToCheck = Repository.getEnvsFromTextInputString(envInputString);

            if (!envToCheck.length) {
                bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${Repository.DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`);
                return;
            }

            const format = new Format();
            const whatsOnline = new WhatsOnline(request, format);
            const work = whatsOnline.getUrls(envToCheck);

            bot.reply(message, `i'll check ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

            whatsOnline.check(work)
                .then(replyText => {
                    bot.reply(message, replyText);
                })
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
        handler: (bot, message) => {

            fun.getRandomMsg(funnyStuff => bot.reply(message, funnyStuff));

            const envInputString = message.text
                .replace(message.match[0], '')
                .trim()
                .toUpperCase();

            let envToCheck = Repository.getEnvsFromTextInputString(envInputString);

            if (!envToCheck.length) {
                bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${Repository.DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`);
                return;
            }

            const format = new Format();
            const whatsOnline = new WhatsOnline(request, format);
            const work = whatsOnline.getUrls(envToCheck);

            bot.reply(message, `diff'ing ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

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
                        ? '... looks the same to me →' + envToCheck.map(it => '`' + it + '`').join(' == ')
                        : (grpByAppHash as any)
                            .map((list: IEnvResponse[]) => {
                                const versionStr = list[0].lastCommit
                                    ? list[0].version + '' + new Format().commit(list[0].lastCommit)
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
