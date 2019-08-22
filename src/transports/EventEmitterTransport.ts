import { EventEmitter } from "events";
import ITransport from "./Transport";

class EventEmitterTransport implements ITransport {
  public connection: EventEmitter;
  private reqUri: string;
  private resUri: string;
  private onDataCallbacks: any[];
  constructor(emitter: EventEmitter, reqUri: string, resUri: string) {
    this.onDataCallbacks = [];
    this.connection = emitter;
    this.reqUri = reqUri;
    this.resUri = resUri;
  }

  public connect(): Promise<any> {
    this.connection.on(this.reqUri, (data: any) => {
      this.onDataCallbacks.map((callback: (data: string) => void) => {
        callback(data);
      });
    });
    return Promise.resolve();
  }

  public onData(callback: (data: string) => void) {
    this.onDataCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    // noop
  }

  public sendData(data: string) {
    this.connection.emit(this.resUri, data);
  }

  public close() {
    this.connection.removeAllListeners();
  }
}

export default EventEmitterTransport;
