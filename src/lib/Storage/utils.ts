import BaseStorage from './BaseStorage'


export function cleanRedis(uri: string) {
  const base = new BaseStorage(uri);
  return base.clearAll().then(_ => {
    console.log('redis is clean');
    return base.keys().then(listOfKey => {
      console.log('listOfKey', listOfKey);
      return base.all()
        .catch((error: any) => {
          if (error && error.displayName === 'NotFound') {
            console.log('OK DONE');
            return [];
          } else {
            throw error;
          }
        })
        .then((listofValues: any[]) => (console.log('listofValues', listofValues), true))
    });
  });
}
