const bluebird = require('bluebird');
const redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class BaseStorage {

    _client;

    constructor(uri: string) {
        this._client = redis.createClient(uri);
    }

    get = k => this._client.getAsync(k).then(value => JSON.parse(value)).then(data => {
        if (data === null) {
            throw { displayName: 'NotFound' };
        } else {
            return data;
        }
    });

    save = (k, value) => this._client.setAsync(k, JSON.stringify(value))

    delete = k => this._client.setAsync(k, null);

    all = (partial = null) => this._client.keysAsync('*')
        .then(keys => Promise.all(
            keys
                .filter(key => (partial === null) || key.indexOf(partial) > -1)
                .map(key => this.get(key))
        ));
}

class PartialStore {
    constructor(private _store, private _name) {
    }

    _convertKey = k => `${this._name}:${k}`;

    get = k => this._store.get(this._convertKey(k));

    save = (k, value) => this._store.save(this._convertKey(k), value);

    delete = k => this._store.delete(this._convertKey(k))

    all = () => this._store.all(this._name);
}


module.exports = function (uri) {

    const db = new BaseStorage(uri);

    const teams_db = new PartialStore(db, 'teams');
    const users_db = new PartialStore(db, 'users');
    const channels_db = new PartialStore(db, 'channels');

    return {
        teams: {
            get: (team_id, cb) => {
                teams_db.get(team_id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            save: (team_data, cb) => {
                teams_db.save(team_data.id, team_data)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            delete: (team_id, cb) => {
                teams_db.delete(team_id.id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            all: (cb) => {
                teams_db.all()
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            }
        },
        users: {
            get: (team_id, cb) => {
                users_db.get(team_id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            save: (team_data, cb) => {
                users_db.save(team_data.id, team_data)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            delete: (team_id, cb) => {
                users_db.delete(team_id.id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            all: (cb) => {
                users_db.all()
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            }
        },
        channels: {
            get: (team_id, cb) => {
                channels_db.get(team_id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            save: (team_data, cb) => {
                channels_db.save(team_data.id, team_data)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            delete: (team_id, cb) => {
                channels_db.delete(team_id.id)
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            },
            all: (cb) => {
                channels_db.all()
                    .then(data => cb(null, data))
                    .catch(error => (console.log('error', error), cb(error, null)));
            }
        }
    };
};
