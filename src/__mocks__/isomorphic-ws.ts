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
  public send(data: any) {

    if (this.url.match(/crash-null/)) {
      return;
    }
    if (this.url.match(/crash/)) {
      throw new Error("Random Segfault that crashes fetch");
    }

    Object.entries(this.callbacks).forEach(([eventName, cb]: [string, any]) => {
      if (eventName === "message") {
        cb({ data: req.generateMockResponseData(this.url, data) });
      }
    });
  }
  public close() {
    this.callbacks = {};
  }
}

export default WebSocket;
