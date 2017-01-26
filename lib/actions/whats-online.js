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
    'CO': 'configuration'
}

const frontendEnvironments = {
    'ET': 'https://et.coresystems.net',
    'QT': 'https://qt.coresystems.net',
    'PT': 'https://pt.coresystems.net',
    'SANDBOX': 'https://sb.coresystems.net',
    'PROD': 'https://apps.coresystems.net',
    'DE': 'https://de.coresystems.net',
    'EU': 'https://eu.coresystems.net',
    'CN': 'https://cn.coresystems.net',
    'US': 'https://us.coresystems.net',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net'
}

const cloud = {
    'ET': 'https://et.dev.coresuite.com/dc/status',
    'QT': 'https://qt.dev.coresuite.com/dc/status',
    'PT': 'https://pt.dev.coresuite.com/dc/status',
    'PROD': 'https://ds.coresuite.com/dc/status',
    'DE': 'https://de.coresuite.com/dc/status',
    'EU': 'https://eu.coresuite.com/dc/status',
    'US': 'https://us.coresuite.com/dc/status',
    'CN': 'https://cn.coresuite.com/dc/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/dc/status'
}

const facade = {
    'ET': 'https://et.dev.coresuite.com/portal/status',
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


const allKnownEnvironments = [];
[
    ...Object.keys(frontendEnvironments),
    ...Object.keys(facade),
    ...Object.keys(cloud)
].forEach(env => {
    allKnownEnvironments.indexOf(env) === -1
        ? allKnownEnvironments.push(env)
        : void 0;
});

const defaultEnvironments = [
    'ET',
    'QT',
    'PT',
    'PROD',
    'SANDBOX'
].filter(e => allKnownEnvironments.indexOf(e) !== -1);


class WhatsOnline {

    constructor(get, doNotThrow = true) {
        this.get = get
        // opt => get(opt).then(response => !doNotThrow ? (console.log(JSON.stringify(opt)), response) : response);
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

        const dateString = days <= 1 ? sampDate.fromNow() : sampDate.format('DD.MM HH:mm');

        return `${verb}: ${dateString}`;
    }

    formatGitHubTag(app, version) {
        return `<https://github.com/coresystemsFSM/portal/releases/tag/${apps[app]}-${version}|${version}>`
    }

    formatGitHubCommit(commit) {
        return `(<https://github.com/coresystemsFSM/portal/commits/${commit}|${commit.substr(0, 5) + '...'}>)`;
    }

    generateResultObj(msg, env, app, hash, version) {
        return { msg, env, app, hash, version };
    }

    generateErrorMsg(error, env, app, url) {
        if (this.doNotThrow) {
            //console.log(error);
            return `<${url}|${env}> | ${app} => looks offline`;
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

                const versionStr = json.appConfig.version ? this.formatGitHubTag(app, json.appConfig.version) : 'no version';
                const commitStr = json.lastCommit ? this.formatGitHubCommit(json.lastCommit) : '';
                const buildStr = json.buildTimestamp ? this.formatDate('build', json.buildTimestamp) : '';
                const deployedStr = deployDate ? this.formatDate('last-modified', deployDate) : '';

                // buildStr
                return `<${url}|${env}> | ${app.toUpperCase()} => ${[versionStr, commitStr, deployedStr].filter(x => x !== '').join(', ')}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash, version));
    }

    getVersionCloud(env, url) {
        let hash = ''
        const app = 'CLOUD';
        return this.get(url)
            .then(rawBody => {
                hash = rawBody;

                return `<${url}|${env}> | ${app} => ${rawBody}`
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash));
    }

    getVersionFacade(env, url) {
        let hash = '';
        const app = 'FACADE';
        return this.get(url)
            .then(rawBody => {
                const json = JSON.parse(rawBody);
                hash = json.lastCommit;

                const version = 'no version number found';
                const lastCommit = json.lastCommit && json.lastCommit !== 'UNKNOWN' ? this.formatGitHubCommit(json.lastCommit) : 'UNKNOWN';
                const buildTimestamp = json.buildTimestamp && json.buildTimestamp !== 'UNKNOWN' ? this.formatDate('build', json.buildTimestamp) : 'UNKNOWN';
                return `<${url}|${env}> | ${app} => ${version} ${lastCommit} ${buildTimestamp}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url))
            .then(msg => this.generateResultObj(msg, env, app, hash));
    }

    getUrls(envToCheck = []) {
        let work = [];


        const envFilter = (env) => {
            return envToCheck.length === 0
                || envToCheck.map(e => e.toLowerCase()).indexOf(env.toLowerCase()) > -1;
        }

        // Front ends 
        Object.keys(frontendEnvironments)
            .filter(envFilter)
            .map(env => {
                Object.keys(apps).map(appShortName => {
                    const url = `${frontendEnvironments[env]}/${apps[appShortName]}/${VERSION_FILE}`;
                    work.push(this.getVersionFrontend(`${env}`, appShortName, url));
                });
            });

        // cloud 
        work = work.concat(
            Object.keys(cloud)
                .filter(envFilter)
                .map(env => this.getVersionCloud(env, cloud[env]))
        );

        // facade 
        work = work.concat(
            Object.keys(facade)
                .filter(envFilter)
                .map(env => this.getVersionFacade(env, facade[env]))
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
            ? allKnownEnvironments
            : (envInputString.indexOf(',') > 1
                ? envInputString.split(',')
                : envInputString.split(' '))
                .map(it => it.trim())
                .filter(it => !!it && allKnownEnvironments.indexOf(it) > -1)
        : defaultEnvironments;
}


module.exports = {
    actions: [
        {
            triggers: [
                'version ',
                "what's online",
                'v '
            ],
            help: `i will check each environment and tell you what version is deployed, you can also check for a specific env => ${defaultEnvironments.map(e => "`" + e + "`").join(', ')}`,
            handler: (bot, message) => {

                const envInputString = message.text
                    .replace(message.match[0], '')
                    .trim()
                    .toUpperCase();

                let envToCheck = getEnvsFromTextInputString(envInputString);

                if (!envToCheck.length) {
                    bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${defaultEnvironments.map(e => "`" + e + "`").join(', ')}`);
                    return;
                }

                const whatsOnline = new WhatsOnline(request);
                const work = whatsOnline.getUrls(envToCheck);

                bot.reply(message, `ok, give me a sec,\ni'll check ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

                whatsOnline.check(work)
                    .then(replyText => {
                        bot.reply(message, replyText);
                    })
                    .catch(er => bot.reply(message, `something went wront... ${JSON.stringify(er)}`));
            }
        },
        {
            triggers: [
                'diff ',
                'd '
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
                    bot.reply(message, `mhm? unknown environment ... \n try without a specific env or some of ${defaultEnvironments.map(e => "`" + e + "`").join(', ')}`);
                    return;
                }

                const whatsOnline = new WhatsOnline(request);
                const work = whatsOnline.getUrls(envToCheck)

                bot.reply(message, `ok, let's diff ${envToCheck.map(e => "`" + e.toUpperCase() + "`").join(', ')} on ${work.length} servers ...`);

                Promise.all(work)
                    .then(results => {
                        const grpByAppHash = _.chain(results)
                            .filter(it => !!it.hash)
                            .groupBy(it => `${it.app} ${it.hash}`);

                        return grpByAppHash
                            .keys()
                            .value().length === [...Object.keys(apps), 'FACADE', 'CLOUD'].length
                            ? 'The all look the same to me =>' +envToCheck.map(it => '`' + it + '`').join(' == ')
                            : grpByAppHash
                                .map((list, key) => `${list[0].app} | ${list[0].version ? list[0].version : list[0].hash.substr(0, 14) + '...'} => ` + list.map(it => '`' + it.env + '`').join(' == '))
                                .sort()
                                .join('\n')
                                .value()
                    })
                    .then(replyText => {
                        bot.reply(message, replyText);
                    })
                    .catch(er => bot.reply(message, `something went wront... ${JSON.stringify(er)}`));

            }
        }
    ],
    default: WhatsOnline,
    allKnownEnvironments: allKnownEnvironments
}