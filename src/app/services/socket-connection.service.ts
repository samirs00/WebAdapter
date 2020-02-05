import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SocketConnectionService {



  private _broadcast: Subject<any> = new Subject<any>();
  public broadcastObservable = this._broadcast.asObservable();
  constructor(
    private socket: Socket
  ) { 
  }

  listenEvent() {
    this.socket.on('broadcast_message', (data)=>{
      // console.log("broadcast message : ", data);
      this._broadcast.next(data);
    });
  }

  removeEvent(event) {
    this.socket.removeAllListeners(event);
  }
}
