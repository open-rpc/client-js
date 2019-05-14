import { EventEmitter } from "events";
import ITransport from "./Transport";

class EventEmitterTransport implements ITransport {
  public connection: EventEmitter | null;
  constructor(uri: string) {
    this.connection = new EventEmitter();
  }
  public connect(): Promise<any> {
    // noop
    return Promise.resolve();
  }
  public onData(callback: any) {
    if (!this.connection) {
      return;
    }
    this.connection.addListener("message", (data: any) => {
      callback(data);
    });
  }
  public sendData(data: any) {
    if (!this.connection) {
      return;
    }
    this.connection.emit("message", data);
  }
  public close() {
    if (!this.connection) {
      return;
    }
    this.connection.removeAllListeners();
    this.connection = null;
  }
}

export default EventEmitterTransport;
