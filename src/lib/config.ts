export class Config {
  public readonly buildServerBase = process.env.buildServerBase
    ? process.env.buildServerBase
    : '';

  public readonly androidSecretMap = process.env.androidSecretMap
    ? process.env.androidSecretMap
    : `{"nightly":["a","b"],"beta":["a","b"],"store":["a","b"],"iron":["a","b"],"tosca":["a","b"]}`

};

const Singleton = new Config();

export default Singleton;
