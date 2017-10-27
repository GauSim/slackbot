export class Config {
  public readonly buildServerBase = process.env.buildServerBase
    ? process.env.buildServerBase
    : '';

  // formats => [env]:[id]:[token], [...]
  public readonly androidSecrets = process.env.androidSecrets
    ? process.env.androidSecrets
    : ''

  public readonly isDevelopmentMode = !!process.env.development && process.env.development === 'true';
};

const Singleton = new Config();

export default Singleton;
