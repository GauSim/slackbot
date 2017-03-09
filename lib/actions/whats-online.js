const request = require('request-promise');
const _ = require('underscore');
//const moment = require('moment');
const moment = require('moment-timezone');

const VERSION_FILE = 'appconfig.json';

const apps = {
    'WFM': 'workforce-management',
    'AR': 'analytics-reporting',
    'MDM': 'master-data-management',
    'KM': 'knowledge-management',
    'SM': 'system-monitoring',
    'PM': 'project-management',
    'DL': 'dataloader',
    'CO': 'configuration',
    'MAP': 'map'
}

const ENV_FRONTENDS = {
    'ET': 'https://et.coresystems.net',
    'QT': 'https://qt.coresystems.net',
    'PT': 'https://pt.coresystems.net',
    'SANDBOX': 'https://sb.coresystems.net',
    'PROD': 'https://apps.coresystems.net',
    'DE': 'https://de.coresystems.net',
    'EU': 'https://eu.coresystems.net',
    'CN': 'https://cn.coresystems.net',
    'US': 'https://us.coresystems.net',
    'UT':'https://ut.coresystems.net',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net'
}

const ENV_NAME_ADMIN = 'ADMIN';
const ENV_ADMIN = {
    'ET': 'https://et.coresystems.net/admin/status',
    'UT': 'https://ut.coresystems.net/admin/status',
    'QT': 'https://qt.coresystems.net/admin/status',
    'PT': 'https://pt.coresystems.net/admin/status',
    'PROD': 'https://apps.coresystems.net/admin/status',
    'DE': 'https://de.coresystems.net/admin/status',
    'EU': 'https://eu.coresystems.net/admin/status',
    'US': 'https://us.coresystems.net/admin/status',
    'CN': 'https://cn.coresystems.net/admin/status',
    'SANDBOX': 'https://sb.coresystems.net/admin/status',
}

const ENV_NAME_DATA_CLOUD = 'DC';
const ENV_DATA_CLOUD = {
    'ET': 'https://et.dev.coresuite.com/dc/status',
    'UT': 'https://ut.dev.coresuite.com/dc/status',
    'QT': 'https://qt.dev.coresuite.com/dc/status',
    'PT': 'https://pt.dev.coresuite.com/dc/status',
    'PROD': 'https://ds.coresuite.com/dc/status',
    'DE': 'https://de.coresuite.com/dc/status',
    'EU': 'https://eu.coresuite.com/dc/status',
    'US': 'https://us.coresuite.com/dc/status',
    'CN': 'https://cn.coresuite.com/dc/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/dc/status'
}
const ENV_NAME_MASTER_CLOUD = 'MC';
const ENV_MASTER_CLOUD = {
    'ET': 'https://et.dev.coresuite.com/mc/status',
    'UT': 'https://ut.dev.coresuite.com/mc/status',
    'QT': 'https://qt.dev.coresuite.com/mc/status',
    'PT': 'https://pt.dev.coresuite.com/mc/status',
    'PROD': 'https://ds.coresuite.com/mc/status',
    'DE': 'https://de.coresuite.com/mc/status',
    'EU': 'https://eu.coresuite.com/mc/status',
    'US': 'https://us.coresuite.com/mc/status',
    'CN': 'https://cn.coresuite.com/mc/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/mc/status'
}



const ENV_NAME_FACADE = 'FACADE';
const ENV_FACADE = {
    'ET': 'https://et.dev.coresuite.com/portal/status',
    'UT': 'https://et.dev.coresuite.com/portal/status',
    'QT': 'https://qt.dev.coresuite.com/portal/status',
    'PT': 'https://pt.dev.coresuite.com/portal/status',
    'PROD': 'https://apps.coresystems.net/portal/status',
    'DE': 'https://de.coresystems.net/portal/status',
    'CN': 'https://cn.coresystems.net/portal/status',
    'EU': 'https://eu.coresystems.net/portal/status',
    'US': 'https://us.coresystems.net/portal/status',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net/portal/status',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net/portal/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/portal/status'
}

const NO_VERSION_NUMBER_FOUND = 'no version number found';


const ALL_KNOWN_ENVIRONMENTS = [];
[
    ...Object.keys(ENV_FRONTENDS),
    ...Object.keys(ENV_FACADE),
    ...Object.keys(ENV_DATA_CLOUD),
    ...Object.keys(ENV_ADMIN)
].forEach(env => {
    ALL_KNOWN_ENVIRONMENTS.indexOf(env) === -1
        ? ALL_KNOWN_ENVIRONMENTS.push(env)
        : void 0;
});

const DEFAULT_ENVIRONMENTS = [
    'ET',
    'QT',
    'PT',
    'PROD',
    'SANDBOX'
].filter(e => ALL_KNOWN_ENVIRONMENTS.indexOf(e) !== -1);


class WhatsOnline {

    constructor(get, doNotThrow = true) {
        this.get = opt => {
            const url = typeof opt === 'string' ? opt : opt.uri; 
            console.log(`GET | ${url}`);
            return get(opt)
                .then(response => {
                    console.log(`${response.statusCode ? response.statusCode : 200} | ${url}`);
                    return response;
                });
        }
        this.doNotThrow = doNotThrow;
    }


    formatDate(verb, stamp) {

        const dateISOString = new Date(stamp).toISOString();
        let sampDate = moment.utc(dateISOString);

        // hack, 2016-12-30T21:03:51.813Z => missing offset, adding 1 hour :) 
        if (stamp.indexOf('Z') > -1) {
            sampDate = sampDate.add(1, 'hours');
        }

        const now = moment(new Date().toISOString()); //todays date        
        const duration = moment.duration(now.diff(sampDate));
        const days = duration.asDays();

        const dateString = days <= 1 ? sampDate.utc().fromNow() : sampDate.utc().format('DD.MM h:mm');

        return `${verb}: ${dateString}`;
    }

    formatGitHubCommit(commit) {
        return `(<https://github.com/coresystemsFSM/portal/commits/${commit}|${commit.substr(0, 5) + '...'}>)`;
    }

    generateResultObj(msg, env, app, hash, version) {
        return { msg, env, app, hash, version };
    }

    generateErrorMsg(error, env, app, url) {
        if (this.doNotThrow) {
            console.log({ error, env, app, url });
            return ("`" + env + "`") + ` | <${url}|${app}> → looks offline`;
        } else {
            throw new Error(error);
        }
    }

    getVersionFrontend(env, app, url) {
        let hash = '';
        let version = '';
        
        return this.get({
            method: 'GET',
            uri: url,
            resolveWithFullResponse: true
        })
            .then(response => {
                const {headers, body, statusCode} = response;
                if (statusCode !== 200) {
                    throw response;
                }
                const deployDate = headers["last-modified"];
                return { body, deployDate };
            })
            .then(({body, deployDate}) => {
                const json = JSON.parse(body);
                hash = json.lastCommit;
                version = json.appConfig.version;

                version = json.appConfig.version
                    ? (env.toLowerCase() === 'et'
                        ? '>'
                        : '') + json.appConfig.version
                    : NO_VERSION_NUMBER_FOUND;

                const commitStr = json.lastCommit
                    ? this.formatGitHubCommit(json.lastCommit)
                    : '';
                const buildStr = json.buildTimestamp
                    ? this.formatDate('build', json.buildTimestamp)
                    : '';
                const deployedStr = deployDate
                    ? this.formatDate('last-modified', deployDate)
                    : '';

                return ("`" + env + "`")
                    + ` | <${url}|${app.toUpperCase()}> → ${[version, commitStr, deployedStr].filter(x => x !== '').join(' ')}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash, version));
    }

    getVersionCloud(env, app, url) {
        let hash = '';
        let version = '';
        
        return this.get(url)
            .then(rawBody => {
            
                const exp = new RegExp(/([0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]?\.[0-9][0-9]?[0-9]?)/);
                if (exp.test(rawBody))
                    version = exp.exec(rawBody)[0];

                hash = version
                    ? version
                    : rawBody;

                let date = '';
                if (version)
                    date = moment(
                        rawBody
                            .toLowerCase()
                            .replace(`${app}-${version}`.toLowerCase(), '')
                            .replace('(', '')
                            .replace(')', '')
                            .toUpperCase(),
                        moment.ISO_8601)
                        .utc()
                        .format('DD.MM h:mm');

                const pretty = version && date
                    ? `${version} last-modified: ${date}`
                    : rawBody;

                return ("`" + env + "`")
                    + ` | <${url}|${app}> → ${pretty}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash, version ? version : null));
    }

    getVersionFacade(env, app, url) {
        let hash = '';
        let version = NO_VERSION_NUMBER_FOUND;
        return this.get(url)
            .then(rawBody => {
                const json = JSON.parse(rawBody);
                hash = json.lastCommit;

                version = json.version
                    ? (env.toLowerCase() === 'et'
                        ? '>'
                        : '') + json.version
                    : NO_VERSION_NUMBER_FOUND;

                const lastCommit = json.lastCommit && json.lastCommit !== 'UNKNOWN'
                    ? this.formatGitHubCommit(json.lastCommit)
                    : 'UNKNOWN';

                const buildTimestamp = json.buildTimestamp && json.buildTimestamp !== 'UNKNOWN'
                    ? this.formatDate('build', json.buildTimestamp)
                    : 'UNKNOWN';

                return ("`" + env + "`")
                    + ` | <${url}|${app}> → ${version} ${lastCommit} ${buildTimestamp}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash, version !== NO_VERSION_NUMBER_FOUND ? version : null));
    }

    getUrls(envToCheck = []) {
        let work = [];


        const envFilter = (env) => {
            return envToCheck.length === 0
                || envToCheck.map(e => e.toLowerCase()).indexOf(env.toLowerCase()) > -1;
        }

        // Front ends 
        Object.keys(ENV_FRONTENDS)
            .filter(envFilter)
            .map(env => {
                Object.keys(apps).map(appShortName => {
                    const url = `${ENV_FRONTENDS[env]}/${apps[appShortName]}/${VERSION_FILE}`;
                    work.push(this.getVersionFrontend(`${env}`, appShortName, url));
                });
            });

        // data cloud 
        work = work.concat(
            Object.keys(ENV_DATA_CLOUD)
                .filter(envFilter)
                .map(env => this.getVersionCloud(env, ENV_NAME_DATA_CLOUD, ENV_DATA_CLOUD[env]))
        );

        // master cloud 
        work = work.concat(
            Object.keys(ENV_MASTER_CLOUD)
                .filter(envFilter)
                .map(env => this.getVersionCloud(env, ENV_NAME_MASTER_CLOUD, ENV_MASTER_CLOUD[env]))
        );

        // admin
        work = work.concat(
            Object.keys(ENV_ADMIN)
                .filter(envFilter)
                .map(env => this.getVersionCloud(env, ENV_NAME_ADMIN, ENV_ADMIN[env]))
        );

        // facade 
        work = work.concat(
            Object.keys(ENV_FACADE)
                .filter(envFilter)
                .map(env => this.getVersionFacade(env, ENV_NAME_FACADE, ENV_FACADE[env]))
        );

        return work;
    }

    check(work) {
        const start = moment(new Date());
        return Promise.all(work)
            .then(results => _.sortBy([...results.map(it => it.msg)]).join('\n'))
            .then(msg => `${msg}\n i'm done, all dates are in UTC+0, i did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }
}


function getEnvsFromTextInputString(envInputString) {
    return envInputString
        ? envInputString === 'ALL'
            ? ALL_KNOWN_ENVIRONMENTS
            : (envInputString.indexOf(',') > 1
                ? envInputString.split(',')
                : envInputString.split(' '))
                .map(it => it.trim())
                .filter(it => !!it && ALL_KNOWN_ENVIRONMENTS.indexOf(it) > -1)
        : DEFAULT_ENVIRONMENTS;
}


module.exports = {
    actions: [
        {
            triggers: [
                'version ',
                "what's online",
                'v ',
                '1'
            ],
            help: `i will check each environment and tell you what version is deployed, you can also check for a specific env => ${DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`,
            handler: (bot, message) => {

                bot.reply(message, 'woop woop!');

                const envInputString = message.text
                    .replace(message.match[0], '')
                    .trim()
                    .toUpperCase();

                let envToCheck = getEnvsFromTextInputString(envInputString);

                if (!envToCheck.length) {
                    bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`);
                    return;
                }

                const whatsOnline = new WhatsOnline(request);
                const work = whatsOnline.getUrls(envToCheck);

                bot.reply(message, `ok, give me a sec,\ni'll check ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

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
                'd ',
                '2'
            ],
            help: `ill try to get a diff of the env's`,
            handler: (bot, message) => {

                bot.reply(message, 'yes homie!');

                const envInputString = message.text
                    .replace(message.match[0], '')
                    .trim()
                    .toUpperCase();

                let envToCheck = getEnvsFromTextInputString(envInputString);

                if (!envToCheck.length) {
                    bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${DEFAULT_ENVIRONMENTS.map(e => "`" + e + "`").join(', ')}`);
                    return;
                }

                const whatsOnline = new WhatsOnline(request);
                const work = whatsOnline.getUrls(envToCheck);

                bot.reply(message, `ok, let's diff ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

                Promise.all(work)
                    .then(results => {
                        const grpByAppHash = _.chain(results)
                            .filter(it => !!it.hash)
                            .groupBy(it => `${it.app} ${it.version}`);

                        return grpByAppHash
                            .keys()
                            .value().length === [
                                ...Object.keys(apps),
                                ENV_NAME_FACADE,
                                ENV_NAME_DATA_CLOUD,
                                ENV_NAME_MASTER_CLOUD,
                                ENV_NAME_ADMIN,
                            ].length
                            ? '... looks the same to me →' + envToCheck.map(it => '`' + it + '`').join(' == ')
                            : grpByAppHash
                                .map((list, grpHash) => {
                                    const versionStr = list[0].version
                                        ? list[0].version
                                        : list[0].hash.substr(0, 20) + '...';
                                    const appStr = list[0].app;
                                    return `${appStr} | ${versionStr} → ` + list.map(it => '`' + it.env + '`').join(' == ')
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
    ],
    default: WhatsOnline,
    allKnownEnvironments: ALL_KNOWN_ENVIRONMENTS
}