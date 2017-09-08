import io = require('socket.io-client');
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import { AppName, Application } from './Application';
import { IRequestOptions, Environment } from './Environment';


export type SocketEvent = { type: 'SUCCESS', event: 'connect' | 'disconnect' | 'ping', payload: null | undefined }
  | { type: 'SUCCESS', event: 'pong', payload: number }
  | { type: 'SUCCESS', event: 'event', payload: any }
  | { type: 'ERROR', event: 'reconnect_error' | 'connect_timeout' | 'connect_error' | 'error', payload: Error }

export type ApplicationSocketEvent = SocketEvent & { env: Environment };


export class RealTime {
  public static getStream(it: Environment) {


    return new Observable<ApplicationSocketEvent>((observer) => {

      const rtInfo = it.app.getRealTimeInfo(it.env);
      let socket: SocketIOClient.Socket | undefined;
      if (!rtInfo) {

      } else {

        const convert = (event: SocketEvent): ApplicationSocketEvent => ({ ...event, env: it });

        console.log('connnecting to', rtInfo.url)
        socket = io(rtInfo.url, {
          path: `/portal/realtime`,
          query: `token=${rtInfo.token}`,
          autoConnect: true,
          reconnectionAttempts: 5,
          transports: ['websocket']
        })

        socket
          .on('connect', () => observer.next(convert({ type: 'SUCCESS', event: 'connect', payload: null })))
          .on('event', payload => observer.next(convert({ type: 'SUCCESS', event: 'event', payload })))
          .on('ping', payload => observer.next(convert({ type: 'SUCCESS', event: 'ping', payload })))
          .on('pong', latencyMs => observer.next(convert({ type: 'SUCCESS', event: 'pong', payload: latencyMs })))
          .on('reconnect', n => observer.next(convert({ type: 'SUCCESS', event: 'disconnect', payload: n })))
          .on('disconnect', () => observer.next(convert({ type: 'SUCCESS', event: 'disconnect', payload: null })))
          .on('reconnect_error', (e: Error) => observer.next(convert({ type: 'ERROR', event: 'reconnect_error', payload: e })))
          .on('connect_timeout', (e: Error) => observer.next(convert({ type: 'ERROR', event: 'connect_timeout', payload: e })))
          .on('connect_error', (e: Error) => observer.next(convert({ type: 'ERROR', event: 'connect_error', payload: e })))
          .on('error', (e: Error) => observer.next(convert({ type: 'ERROR', event: 'error', payload: e })))

      }

      return () => {
        // cleanup
        if (socket) {
          socket.disconnect();
        }
      }
    });
  }

}
