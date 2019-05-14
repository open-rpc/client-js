import WebSocket from "isomorphic-ws";
import ITransport from "./Transport";

class WebSocketTransport implements ITransport {
  public connection: WebSocket | undefined;
  constructor(uri: string) {
    this.connection = new WebSocket(uri);
  }
  public connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connection) { return; }
      const cb = () => {
        if (!this.connection) { return; }
        this.connection.removeEventListener("open", cb);
        resolve();
      };
      this.connection.addEventListener("open", cb);
    });
  }
  public onData(callback: any) {
    if (!this.connection) {
      return;
    }
    this.connection.addEventListener("message", (ev: MessageEvent) => {
      callback(ev.data);
    });
  }
  public sendData(data: any) {
    if (!this.connection) {
      return;
    }
    this.connection.send(data);
  }
  public close() {
    if (!this.connection) {
      return;
    }
    this.connection.close();
  }
}

export default WebSocketTransport;
