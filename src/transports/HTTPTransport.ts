import fetch from "isomorphic-fetch";
import ITransport from "./Transport";

class HTTPTransport implements ITransport {
  private uri: string;
  private onDataCallbacks: any[];
  private onErrorCallbacks: any[];
  constructor(uri: string) {
    this.onErrorCallbacks = [];
    this.onDataCallbacks = [];
    this.uri = uri;
  }
  public connect(): Promise<any> {
    return Promise.resolve();
  }
  public onData(callback: (data: string) => any) {
    this.onDataCallbacks.push(callback);
  }
  public sendData(data: string) {
    fetch(this.uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    }).then((result) => {
      return result.text();
    }).then((result) => {
      this.onDataCallbacks.map((cb) => {
        cb(result);
      });
    }).catch(async (e) => {
      if (!(e instanceof Error)) {
        const responseText = await e.text();
        e = new Error(`HTTP ERROR: ${e.status} ${e.statusText}: ${responseText}`);
      }
      this.onErrorCallbacks.map((callback: (error: any) => void) => {
        callback(e);
      });
    });
  }
  public onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
  }
  public close(): void {
    this.onDataCallbacks = [];
  }
}

export default HTTPTransport;
