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


    formatBuildStamp(stamp) {
        const date = new Date(stamp);
        // ${moment(date).format('YYYY-MM-DD HH:mm')}
        return `, was build ${moment(date).fromNow()}`;
    }

    formatGitHubTag(app, version) {
        return `<https://github.com/coresystemsFSM/portal/releases/tag/${app}-${version}|${version}>`
    }

    formatGitHubCommit(commit, linkText) {
        return `(<https://github.com/coresystemsFSM/portal/commit/${commit}|${linkText}>)`;
    }

    generateErrorMsg(error, env, app, url) {
        if (this.doNotThrow) {
            return `<${url}|${env}> | ${app.toUpperCase()} => request failed!`;
        } else {
            throw new Error(error);
        }
    }

    getVersionFrontend(env, app, url) {
        return this.get(url)
            .then(rawContent => {
                const json = JSON.parse(rawContent);
                const version = json.appConfig.version ? this.formatGitHubTag(app, json.appConfig.version) : 'no version number found';
                const lastCommit = json.lastCommit ? this.formatGitHubCommit(json.lastCommit, 'view commit') : '';
                const buildTimestamp = json.buildTimestamp ? this.formatBuildStamp(json.buildTimestamp) : '';
                return `<${url}|${env}> | ${app.toUpperCase()} => ${version} ${lastCommit} ${buildTimestamp}`;
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
                const lastCommit = json.lastCommit && json.lastCommit !== 'UNKNOWN' ? this.formatGitHubCommit(json.lastCommit, json.lastCommit.substr(0, 5) + '...') : 'UNKNOWN';
                const buildTimestamp = json.buildTimestamp ? this.formatBuildStamp(json.buildTimestamp) : '';
                return `<${url}|${env}> | ${app} => ${version} ${lastCommit} ${buildTimestamp}`;
            })
            .catch(error => this.generateErrorMsg(error, env, app, url));
    }

    checkAll() {

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

        return Promise.all(work).then(results => _.sortBy([...results]).join('\n'));
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

            const whatsOnline = new WhatsOnline(request);

            bot.reply(message, `wait, i'll check for you...`);
            whatsOnline.checkAll()
                .then(replyText => {
                    bot.reply(message, replyText);
                });
        }
    },
    default: WhatsOnline
}