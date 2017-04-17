import bluebird = require('bluebird');
import redis = require("redis");



bluebird.promisifyAll((redis as any).RedisClient.prototype);
bluebird.promisifyAll((redis as any).Multi.prototype);

const EMPTY_BLOB = '';

interface IRedisClient {
  getAsync: (key: string) => Promise<string>;
  setAsync: (key: string, value: any) => Promise<string>;
  keysAsync: (key: string) => Promise<string[]>;
  quit();
}

export interface IBaseStorage {
  get: <T>(key: string) => Promise<T>;
  save: <T>(key: string, value: any) => Promise<T>;
  delete: <T>(key: string) => Promise<T>;
  all: <T>(partial?: string) => Promise<T[]>;
  keys: () => Promise<string[]>;
  matchKey: (key: string) => Promise<string[]>;
}

export default class BaseStorage implements IBaseStorage {

  get: (key: string) => Promise<Object>;
  save: (key: string, value: any) => Promise<Object>;
  delete: (key: string) => Promise<Object>;
  keys: () => Promise<string[]>;
  matchKey: (key: string) => Promise<string[]>;
  kill: () => void;
  all: (partial?: string) => Promise<Object[]>;
  clearAll: (partial?: string) => Promise<Object[]>;
  allAsMap: () => Promise<any>;

  constructor(uri) {

    const _client: IRedisClient = redis.createClient(uri) as any as IRedisClient;

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

    this.allAsMap = () => {
      return this.keys()
        .then((listOfKeys) => {
          const redis = {};
          const work = listOfKeys.map(key => {
            return this.get(key)
              .then(value => {
                redis[key] = value;
              })
              .catch(r => {
                redis[key] = null;
              });
          });
          return Promise.all(work).then(() => redis);
        });
    }

    this.keys = () => {
      return this.matchKey('*');
    }

    this.matchKey = (key) => {
      return _client.keysAsync(key);
    }

    this.clearAll = (partial = null) => this.keys()
      .then(keys => Promise.all(keys
        .filter(key => (partial === null) || key.indexOf(partial) > -1)
        .map(key => this.delete(key))));

    this.kill = () => _client.quit();
  }

}
