class PartialStore {
  constructor(_store, _name) {

    const toKey = k => `${_name}:${k}`;

    const fromKey = (fullKey) => {
      return fullKey.replace(toKey(''), '');
    };

    this.get = k => _store.get(toKey(k));

    this.save = (k, value) => _store.save(toKey(k), value);

    this.delete = k => _store.delete(toKey(k));

    // () => {}[]
    this.all = () => _store.all(_name);

    // () => string[]
    this.keys = () => _store.keys().then(keyList =>
      keyList.filter(key => key.indexOf(toKey('')) > -1)
        .map(key => fromKey(key))
    );

    // key:stirng => string[]
    this.matchKey = (k) => _store.matchKey(toKey(k))
      .then(results => results
        .filter(matchKey => fromKey(matchKey) === k)
        .map(matchKey => fromKey(matchKey))
      );

    this._name = _name;
  }
}

module.exports = PartialStore;