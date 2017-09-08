import BaseStorage from './BaseStorage';
import PartialStore from './PartialStore';

// check out => http://redis4you.com/
// const uri = 'redis://simon:61037bdf0be4e6c50c0b60c47cd52a42@50.30.35.9:3328/';

// since decorate partialStore with callback handlers
const toCallbackAPI = (partialStore) => {
  return {
    get: (team_id, cb) => {
      partialStore.get(team_id)
        .then(data => cb(null, data))
        .catch(error => (console.error(`Error [${partialStore._name}] partialStore.get(${team_id})`, error), cb(error, null)));
    },
    save: (team_data, cb) => {
      partialStore.save(team_data.id, team_data)
        .then(data => cb(null, data))
        .catch(error => (console.error(`Error [${partialStore._name}] partialStore.save(${team_data.id}, ${team_data})`, error), cb(error, null)));
    },
    delete: (team_id, cb) => {
      partialStore.delete(team_id.id)
        .then(data => cb(null, data))
        .catch(error => (console.error(`Error [${partialStore._name}] partialStore.delete(${team_id.id})`, error), cb(error, null)));
    },
    all: (cb) => {
      partialStore.all()
        .then(data => cb(null, data))
        .catch(error => (console.error(`Error [${partialStore._name}] partialStore.all()`, error), cb(error, null)));
    }
  }
}


module.exports = function (uri: string) {

  // create main store
  const db = new BaseStorage(uri);


  // create partialStores
  const teams_db = new PartialStore(db, 'teams');
  const users_db = new PartialStore(db, 'users');
  const channels_db = new PartialStore(db, 'channels');

  // export final Storage with callbackAPI
  return {
    teams: toCallbackAPI(teams_db),
    users: toCallbackAPI(users_db),
    channels: toCallbackAPI(channels_db)
  };

};
