import * as req from "./requestData.js";

class WebSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: any;
  private url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(url: string, _props: any) {
    this.callbacks = {};
    this.url = url;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addEventListener(eventName: string, callback: any) {
    this.callbacks[eventName] = callback;
    if (eventName === "open") {
      setTimeout(() => {
        callback();
      }, 10);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public removeEventListener(eventName: string, _callback: any) {
    delete this.callbacks[eventName];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(data: any) {
    if (this.url.match(/crash-null/)) {
      return;
    }
    if (this.url.match(/crash/)) {
      throw new Error("Random Segfault that crashes fetch");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
