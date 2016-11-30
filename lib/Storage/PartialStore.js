class PartialStore {
  constructor(_store, _name) {

    const _convertKey = k => `${_name}:${k}`;

    this.get = k => _store.get(_convertKey(k));

    this.save = (k, value) => _store.save(_convertKey(k), value);

    this.delete = k => _store.delete(_convertKey(k));

    this.all = () => _store.all(_name);

    this._name = _name;
  }
}

module.exports = PartialStore;