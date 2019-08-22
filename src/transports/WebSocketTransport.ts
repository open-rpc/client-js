import WS from "isomorphic-ws";
import ITransport from "./Transport";

class WebSocketTransport implements ITransport {
  public connection: WS;
  private onDataCallbacks: any[];
  private onErrorCallbacks: any[];
  constructor(uri: string) {
    this.connection = new WS(uri);
    this.onDataCallbacks = [];
    this.onErrorCallbacks = [];
  }
  public connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cb = () => {
        this.connection.removeEventListener("open", cb);
        resolve();
      };
      this.connection.addEventListener("open", cb);
      this.connection.addEventListener("message", (ev: { data: string }) => {
        this.onDataCallbacks.map((callback: (data: string) => void) => {
          callback(ev.data);
        });
      });
      this.connection.addEventListener("error", (ev: any) => {
        this.onErrorCallbacks.map((callback: (error: any) => void) => {
          callback(new Error("Websocket Transport Error"));
        });
      });
      this.connection.addEventListener("close", (event: any) => {
        const e: WebSocketEventMap["close"] = event;
        this.onErrorCallbacks.map((callback: (error: any) => void) => {
          callback(new Error(`Websocket Close Error: CODE: ${e.code} REASON: ${e.reason}`));
        });
      });
    });
  }
  public onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }
  public onData(callback: (data: string) => void) {
    this.onDataCallbacks.push(callback);
  }
  public sendData(data: any) {
    this.connection.send(data);
  }
  public close(): void {
    this.connection.close();
  }
}

export default WebSocketTransport;
