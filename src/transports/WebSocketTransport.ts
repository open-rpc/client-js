import WS from "isomorphic-ws";
import ITransport from "./Transport";

class WebSocketTransport implements ITransport {
  public connection: WS;
  constructor(uri: string) {
    this.connection = new WS(uri);
  }
  public connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cb = () => {
        this.connection.removeEventListener("open", cb);
        resolve();
      };
      this.connection.addEventListener("open", cb);
    });
  }
  public onData(callback: (data: string) => any) {
    this.connection.addEventListener("message", (ev: {data: string}) => {
      callback(ev.data);
    });
  }
  public sendData(data: any) {
    this.connection.send(data);
  }
  public close(): void {
    this.connection.close();
  }
}

export default WebSocketTransport;
