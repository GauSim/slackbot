const bluebird = require('bluebird');
const redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
class BaseStorage {
    constructor(uri) {
        this.get = k => this._client.getAsync(k).then(value => JSON.parse(value)).then(data => {
            if (data === null) {
                throw { displayName: 'NotFound' };
            }
            else {
                return data;
            }
        });
        this.save = (k, value) => this._client.setAsync(k, JSON.stringify(value));
        this.delete = k => this._client.setAsync(k, null);
        this.all = (partial = null) => this._client.keysAsync('*')
            .then(keys => Promise.all(keys
            .filter(key => (partial === null) || key.indexOf(partial) > -1)
            .map(key => this.get(key))));
        this._client = redis.createClient(uri);
    }
}
class PartialStore {
    constructor(_store, _name) {
        this._store = _store;
        this._name = _name;
        this._convertKey = k => `${this._name}:${k}`;
        this.get = k => this._store.get(this._convertKey(k));
        this.save = (k, value) => this._store.save(this._convertKey(k), value);
        this.delete = k => this._store.delete(this._convertKey(k));
        this.all = () => this._store.all(this._name);
    }
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
