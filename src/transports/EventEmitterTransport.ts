import { EventEmitter } from "events";
import ITransport from "./Transport";

class EventEmitterTransport implements ITransport {
  public connection: EventEmitter;
  private reqUri: string;
  private resUri: string;
  private onDataCallbacks: any[];
  private onErrorCallbacks: any[];
  constructor(emitter: EventEmitter, reqUri: string, resUri: string) {
    this.onDataCallbacks = [];
    this.onErrorCallbacks = [];
    this.connection = emitter;
    this.reqUri = reqUri;
    this.resUri = resUri;
  }

  public connect(): Promise<any> {
    this.connection.on(this.reqUri, (data: any) => {
      this.onDataCallbacks.map((callback: (data: string, onError: (error: Error) => void) => void) => {
        callback(data, this.sendError.bind(this));
      });
    });
    return Promise.resolve();
  }

  public onData(callback: (data: string, onError: (error: Error) => void) => void) {
    this.onDataCallbacks.push(callback);
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  public sendData(data: string) {
    this.connection.emit(this.resUri, data);
  }

  public close() {
    this.connection.removeAllListeners();
  }

  private sendError(error: Error) {
    this.onErrorCallbacks.map((callback: (error: Error) => void) => {
      callback(error);
    });
  }
}

export default EventEmitterTransport;
