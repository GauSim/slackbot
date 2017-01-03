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
    'PM': 'project-management'
}

const frontendEnvironments = {
    'ET': 'https://et.coresystems.net',
    'QT': 'https://qt.coresystems.net',
    'PT': 'https://pt.coresystems.net',
    'SANDBOX': 'https://sb.coresystems.net',
    'PROD': 'https://apps.coresystems.net',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net'
}

const cloud = {
    'ET': 'https://et.dev.coresuite.com/dc/status',
    'QT': 'https://qt.dev.coresuite.com/dc/status',
    'PT': 'https://pt.dev.coresuite.com/dc/status',
    'PROD': 'https://ds.coresuite.com/dc/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/dc/status'
}

const facade = {
    'ET': 'https://et.dev.coresuite.com/portal/status',
    'QT': 'https://qt.dev.coresuite.com/portal/status',
    'PT': 'https://pt.dev.coresuite.com/portal/status',
    'PROD': 'https://ds.coresuite.com/portal/status',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net/portal/status',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net/portal/status',
    'SANDBOX': 'https://sb.dev.coresuite.com/portal/status'
}

const defaultEnvironments = [
    'ET',
    'QT',
    'PT',
    'PROD',
    'SANDBOX'
];

class WhatsOnline {

    constructor(get, doNotThrow = true) {
        this.get = get;
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

        const dateString = days <= 28 ? sampDate.fromNow() : sampDate.format('DD.MM.YYYY HH:mm');

        return `${verb}: ${dateString}`;
    }

    formatGitHubTag(app, version) {
        return `<https://github.com/coresystemsFSM/portal/releases/tag/${apps[app]}-${version}|${version}>`
    }

    formatGitHubCommit(commit) {
        return `(<https://github.com/coresystemsFSM/portal/commit/${commit}|${commit.substr(0, 5) + '...'}>)`;
    }

    generateErrorMsg(error, env, app, url) {
        if (this.doNotThrow) {
            return `<${url}|${env}> | ${app} looks offline`;
        } else {
            throw new Error(error);
        }
    }

    getVersionFrontend(env, app, url) {
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

                const versionStr = json.appConfig.version ? this.formatGitHubTag(app, json.appConfig.version) : 'no version';
                const commitStr = json.lastCommit ? this.formatGitHubCommit(json.lastCommit) : '';
                const buildStr = json.buildTimestamp ? this.formatDate('build', json.buildTimestamp) : '';
                const deployedStr = deployDate ? this.formatDate('deploy', deployDate) : '';

                return `<${url}|${env}> | ${app.toUpperCase()} => ${[versionStr, buildStr, deployedStr, commitStr].filter(x => x !== '').join(', ')}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url));
    }

    getVersionCloud(env, url) {
        const app = 'CLOUD';
        return this.get(url)
            .then(rawBody => `<${url}|${env}> | ${app} => ${rawBody}`)
            .catch(error => this.generateErrorMsg(error, env, url));
    }

    getVersionFacade(env, url) {
        const app = 'FACADE';
        return this.get(url)
            .then(rawBody => {
                const json = JSON.parse(rawBody);
                const version = 'no version number found';
                const lastCommit = json.lastCommit && json.lastCommit !== 'UNKNOWN' ? this.formatGitHubCommit(json.lastCommit) : 'UNKNOWN';
                const buildTimestamp = json.buildTimestamp && json.buildTimestamp !== 'UNKNOWN' ? this.formatDate('build', json.buildTimestamp) : 'UNKNOWN';
                return `<${url}|${env}> | ${app} => ${version} ${lastCommit} ${buildTimestamp}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url));
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
            .then(results => _.sortBy([...results]).join('\n'))
            .then(msg => `${msg}\n i'm done, all dates are in UTC+0, i did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }
}

module.exports = {
    action: {
        triggers: [
            'version',
            "what's online",
            'v'
        ],
        help: `i will check each environment and tell you what version is deployed, you can also check for a specific env => ${defaultEnvironments.map(e => "`" + e + "`").join(', ')}`,
        handler: (bot, message) => {

            const envInputString = message.text.trim().replace(message.match[0], '');

            let envToCheck = envInputString ?
                (envInputString.indexOf(',') > 1 ? envInputString.split(',') : envInputString.split(' ')) // split commar or space
                    .map(it => it.trim().toUpperCase())
                    .filter(it => !!it // filter ''
                        && [...defaultEnvironments, 'PROD-QA-EU', 'PROD-QA-US'].indexOf(it) > -1 // an unknown env's? 
                    )
                : defaultEnvironments;


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
                });
        }
    },
    default: WhatsOnline
}