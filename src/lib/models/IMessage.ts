export interface IMessage {
  text: string,
  match: [string],
  channel: string,
  ts: number,
  user: string
};