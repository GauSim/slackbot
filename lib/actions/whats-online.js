const request = require('request-promise');
const _ = require('underscore');


const environments = [
    'https://et.coresystems.net',
    'https://qt.coresystems.net',
    'https://pt.coresystems.net',
    'https://sb.coresystems.net',
    'https://apps.coresystems.net',
];

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
    ET: 'https://et.dev.coresuite.com/dc/status',
    QT: 'https://qt.dev.coresuite.com/dc/status',
    PT: 'https://pt.dev.coresuite.com/dc/status',
    PROD: 'https://ds.coresuite.com/dc/status'
}

const facade = {
    ET: 'https://et.dev.coresuite.com/portal/status',
    QT: 'https://qt.dev.coresuite.com/portal/status',
    PT: 'https://pt.dev.coresuite.com/portal/status',
    PROD: 'https://ds.coresuite.com/portal/status'
}

const whatsOnline = () => {
    let work = [];


    // Front ends 
    const urls = [];
    const result = environments.forEach(environmentsUrl => apps.forEach(app => urls.push(`${environmentsUrl}/${app}/${VERSION_FILE}`)));

    work = work.concat(urls.map(url => {
        return request(url)
            .then(rawContent => JSON.parse(rawContent))
            .then(json => `${json.environment.toUpperCase()} ${json.appConfig.title} => ${json.appConfig.version}`)

    }));

    // cloud 
    work = work.concat(
        Object.keys(cloud).map(env => {
            return request(cloud[env]).then(rawBody => `${env} CLOUD => ${rawBody}`);
        })
    )

    // facade 
    work = work.concat(
        Object.keys(facade).map(env => {
            return request(facade[env]).then(rawBody => {
              const json = JSON.parse(rawBody);
              return `${env} FACADE => lastCommit:${json.lastCommit} buildTimestamp:${json.buildTimestamp}`;
            });
        })
    )

    work = work.map(promise => {
        return promise.catch(error => {
            console.log(error);
            return `_Error => ${error.statusCode ? error.statusCode : JSON.stringify(error)}`;
        });
    })

    return Promise.all(work).then(results => {

        const ok = results.filter(msg => msg.indexOf('_Error') === -1);
        const fails = results.filter(msg => msg.indexOf('_Error') > -1);

        return _.sortBy([...ok]).join('\n') + (fails.length ? `\n no info on: ${fails.length} env's` : '');
    });
}

module.exports = {
    triggers: [
        "what's online",
        "whats online",
        'version',
        '^version$'
    ],
    help: `i will check each environment and tell you what version is deployed`,
    handler: (bot, message) => {
        whatsOnline()
            .then(text => {
                console.log(message);
                bot.reply(message, text);
            })
    }
}