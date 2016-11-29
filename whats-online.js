const request = require('request-promise');

const environments = [
  'https://et.coresystems.net',
  'https://qt.coresystems.net',
  'https://pt.coresystems.net',
  'https://apps.coresystems.net',
];

const apps = [
  'workforce-management',
  'analytics-reporting',
  'master-data-management',
  'knowledge-management',
  'system-monitoring'
];

const VERSION_FILE = 'appconfig.json';

const whatsOnline = () => {
  const urls = [];
  const result = environments.forEach(environmentsUrl => apps.forEach(app => urls.push(`${environmentsUrl}/${app}/${VERSION_FILE}`)));
  const work = urls.map(url => {
    return request(url)
      .then(rawContent => JSON.parse(rawContent))
      .then(json => `${json.environment.toUpperCase()} ${json.appConfig.title} => ${json.appConfig.version}`)
      .catch(error => `Error: ${url} => ${JSON.stringify(error)}`)
  });
  return Promise.all(work).then(list => list.join('\n'));
}

module.exports = {
  whatsOnline: whatsOnline
}