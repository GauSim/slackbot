const bluebird = require('bluebird');
const redis = require("redis");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const EMPTY_BLOB = '';


class BaseStorage {

  constructor(uri) {

    const _client = redis.createClient(uri);

    this.get = k => _client.getAsync(k)
      .then(data => {

        if (data === EMPTY_BLOB || data === null) {
          throw { displayName: 'NotFound', key: k };
        }
        else {
          return JSON.parse(data);
        }

      });

    this.save = (k, value) => _client.setAsync(k, JSON.stringify(value));

    this.delete = k => _client.setAsync(k, EMPTY_BLOB);

    this.all = (partial = null) => this.keys()
      .then(keys => {
        const work = keys
          .filter(key => (partial === null) || key.indexOf(partial) > -1) // select partition
          .map(key => this.get(key).catch(error => {

            if (error && error.displayName === 'NotFound') {
              return null; // value is deleted
            }

            throw error;

          }));
        return Promise.all(work).then(resultList => resultList.filter(x => !!x)) // skip deleted values
      });

    this.keys = () => {
      return _client.keysAsync('*');
    }

    this.clearAll = (partial = null) => this.keys()
      .then(keys => Promise.all(keys
        .filter(key => (partial === null) || key.indexOf(partial) > -1)
        .map(key => this.delete(key))));
  }

}

module.exports = BaseStorage;
