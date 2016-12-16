const request = require('request-promise');
const _ = require('underscore');
const moment = require('moment');

const frontendEnvironments = {
    'ET': 'https://et.coresystems.net',
    'QT': 'https://qt.coresystems.net',
    'PT': 'https://pt.coresystems.net',
    'SANDBOX': 'https://sb.coresystems.net',
    'PROD': 'https://apps.coresystems.net',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net'
}

const apps = [
    'workforce-management',
    'analytics-reporting',
    'master-data-management',
    'knowledge-management',
    'system-monitoring',
    'project-management'
];

const VERSION_FILE = 'appconfig.json';

const cloud = {
    'ET': 'https://et.dev.coresuite.com/dc/status',
    'QT': 'https://qt.dev.coresuite.com/dc/status',
    'PT': 'https://pt.dev.coresuite.com/dc/status',
    'PROD': 'https://ds.coresuite.com/dc/status'
}

const facade = {
    'ET': 'https://et.dev.coresuite.com/portal/status',
    'QT': 'https://qt.dev.coresuite.com/portal/status',
    'PT': 'https://pt.dev.coresuite.com/portal/status',
    'PROD': 'https://ds.coresuite.com/portal/status',
    'PROD-QA-EU': 'https://prod-qa-eu.coresystems.net/portal/status',
    'PROD-QA-US': 'https://prod-qa-us.coresystems.net/portal/status',
}


class WhatsOnline {

    constructor(get, doNotThrow = true) {
        this.get = get;
        this.doNotThrow = doNotThrow;
    }


    formatDate(verb, stamp) {
        const date = new Date(stamp);
        const now = moment(new Date()); //todays date        
        const duration = moment.duration(now.diff(date));
        const days = duration.asDays();

        const dateStr = (days <= 28) ? moment(date).fromNow() : moment(date).format('YYYY-MM-DD');

        return `${verb}: ${dateStr}`;
    }

    formatGitHubTag(app, version) {
        return `<https://github.com/coresystemsFSM/portal/releases/tag/${app}-${version}|${version}>`
    }

    formatGitHubCommit(commit) {
        return `(<https://github.com/coresystemsFSM/portal/commit/${commit}|${commit.substr(0, 5) + '...'}>)`;
    }

    generateErrorMsg(error, env, app, url) {
        if (this.doNotThrow) {
            return `<${url}|${env}> | ${app.toUpperCase()} => could not find ${app} on ${env}`;
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

                const versionStr = json.appConfig.version ? this.formatGitHubTag(app, json.appConfig.version) : 'no version number found';
                const commitStr = json.lastCommit ? this.formatGitHubCommit(json.lastCommit) : '';
                const buildStr = json.buildTimestamp ? this.formatDate('build', json.buildTimestamp) : '';
                const deployedStr = deployDate ? this.formatDate('deployed', deployDate) : '';

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

    getUrlsAll() {
        let work = [];

        // Front ends 
        Object.keys(frontendEnvironments).map(env => {
            apps.forEach(app => {
                const url = `${frontendEnvironments[env]}/${app}/${VERSION_FILE}`;
                work.push(this.getVersionFrontend(`${env}`, app, url));
            });
        });

        // cloud 
        work = work.concat(Object.keys(cloud).map(env => this.getVersionCloud(env, cloud[env])));

        // facade 
        work = work.concat(Object.keys(facade).map(env => this.getVersionFacade(env, facade[env])));

        return work;
    }

    check(work) {
        const start = moment(new Date());
        return Promise.all(work)
            .then(results => _.sortBy([...results]).join('\n'))
            .then(msg => `${msg}\n i'm done, did ${work.length} checks in ${(moment.duration(start.diff(new Date())).asSeconds() * -1)} sec.`);
    }
}

module.exports = {
    action: {
        triggers: [
            "what's online",
            "whats online",
            'version',
            '^version$'
        ],
        help: `i will check each environment and tell you what version is deployed`,
        handler: (bot, message) => {

            bot.reply(message, `ok, give me a sec ...`);

            const whatsOnline = new WhatsOnline(request);
            const work = whatsOnline.getUrlsAll();

            bot.reply(message, `i'll check ${work.length} environments for you`);
            
            whatsOnline.check(work)
                .then(replyText => {
                    bot.reply(message, replyText);
                });
        }
    },
    default: WhatsOnline
}