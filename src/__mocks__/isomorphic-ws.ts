import * as req from "./requestData";

class WebSocket {
  private callbacks: any;
  private url: string;
  constructor(url: string, props: any) {
    this.callbacks = {};
    this.url = url;
  }
  public addEventListener(eventName: string, callback: any) {
    this.callbacks[eventName] = callback;
    if (eventName === "open") {
      setTimeout(() => {
        callback();
      }, 10);
    }
  }
  public removeEventListener(eventName: string, callback: any) {
    delete this.callbacks[eventName];
  }
  public send(data: any, callback: (err?: Error) => void) {

    if (this.url.match(/crash-null/)) {
      callback();
      return;
    }
    if (this.url.match(/crash/)) {
      callback(new Error("Random Segfault that crashes fetch"));
      return;
    }

    Object.entries(this.callbacks).forEach(([eventName, cb]: [string, any]) => {
      if (eventName === "message") {
        cb({ data: req.generateMockResponseData(this.url, data) });
        callback();
      }
    });
  }
  public close() {
    this.callbacks = {};
  }
}

export default WebSocket;
