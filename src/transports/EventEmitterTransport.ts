import { EventEmitter } from "events";
import ITransport from "./Transport";

class EventEmitterTransport implements ITransport {
  public connection: EventEmitter;
  private reqUri: string;
  private resUri: string;
  constructor(emitter: EventEmitter, reqUri: string, resUri: string) {
    this.connection = emitter;
    this.reqUri = reqUri;
    this.resUri = resUri;
  }

  public connect(): Promise<any> {
    return Promise.resolve();
  }

  public onData(callback: (data: string) => any) {
    this.connection.on(this.reqUri, (data: any) => {
      callback(data);
    });
  }

  public sendData(data: string) {
    this.connection.emit(this.resUri, data);
  }

  public close() {
    this.connection.removeAllListeners();
  }
}

export default EventEmitterTransport;
