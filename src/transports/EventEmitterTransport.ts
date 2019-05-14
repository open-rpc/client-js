import { EventEmitter } from "events";
import ITransport from "./Transport";

class EventEmitterTransport implements ITransport {
  public connection: EventEmitter;
  constructor(uri: string) {
    this.connection = new EventEmitter();
  }
  public connect(): Promise<any> {
    return Promise.resolve();
  }
  public onData(callback: (data: string) => any) {
    this.connection.addListener("message", (data: any) => {
      callback(data);
    });
  }
  public sendData(data: string) {
    this.connection.emit("message", data);
  }
  public close() {
    this.connection.removeAllListeners();
  }
}

export default EventEmitterTransport;
