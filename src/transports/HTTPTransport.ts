import fetch from "isomorphic-fetch";
import ITransport from "./Transport";

class HTTPTransport implements ITransport {
  private uri: string;
  private onDataCallbacks: any[];
  constructor(uri: string) {
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
    });
  }
  public close(): void {
    this.onDataCallbacks = [];
  }
}

export default HTTPTransport;
