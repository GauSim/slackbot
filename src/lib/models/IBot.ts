import { IMessage } from "./IMessage";

export interface IBot {
  reply: (m: IMessage, msg: string) => void;
  say: (e: { text: string, channel: string; }) => void;
  api: { reactions: { add: any } }
}