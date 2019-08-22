class WebSocket {
  private callbacks: any;
  constructor(uri: string, props: any) {
    this.callbacks = {};
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
  public send(data: string) {
    if (data.includes("close")) {
      return this.callbacks.close(new CloseEvent("type", {code: 1002, reason: "Protocol Error"}));
    }
    if (data.includes("baz")) {
      return this.callbacks.error();
    }
    Object.entries(this.callbacks).forEach(([eventName, callback]: [string, any]) => {
      if (eventName === "message") {
        callback({data});
      }
    });
  }
  public close() {
    this.callbacks = {};
  }
}
export default WebSocket;
