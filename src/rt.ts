import io = require('socket.io-client');
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

const backendHost = 'https://et.dev.coresuite.com';


const cloudHost = 'https://et.dev.coresuite.com';
const formattedAuthToken = '### token ###';
const accountName = '### account ###';
const userAccountName = '### user ###';
const selectedCompanyName = '### company ###';
const clientIdentifier = 'eybot';
const clientVersion = '0.0.1';

function connectToSocket() {

  const token = Buffer.from(`account=${accountName}`
    + `&user=${userAccountName}`
    + `&company=${selectedCompanyName}`
    + `&clientIdentifier=${clientIdentifier}`
    + `&clientVersion=${clientVersion}`
    + `&cloudHost=${cloudHost}`
    + `&authorization=${formattedAuthToken}`).toString('base64');

  return new Observable<{ type: 'connect' | 'disconnect' | 'event' | 'ping' | 'pong', payload: any }>((observer) => {

    const socket = io(backendHost, {
      path: `/portal/realtime`,
      query: `token=${token}`,
      autoConnect: true,
      reconnectionAttempts: 3,
      transports: ['websocket']
    });

    socket
      .on('connect', () => observer.next({ type: 'connect', payload: null }))
      .on('event', payload => observer.next({ type: 'event', payload }))
      .on('ping', payload => observer.next({ type: 'ping', payload }))
      .on('pong', latencyMs => observer.next({ type: 'pong', payload: latencyMs }))
      .on('reconnect', n => observer.next({ type: 'disconnect', payload: n }))
      .on('disconnect', () => observer.next({ type: 'disconnect', payload: null }))
      .on('reconnect_error', e => observer.error(e))
      .on('connect_timeout', e => observer.error(e))
      .on('connect_error', e => observer.error(e))
      .on('error', e => observer.error(e))

    return () => {
      // cleanup
      socket.disconnect();
    }
  });
}


connectToSocket().subscribe(
  d => console.log(d),
  e => console.error(e)
)

console.log('runnig');