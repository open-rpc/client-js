import { Transport } from "./Transport";
import { JSONRPCRequestData, IJSONRPCData, getNotifications } from "../Request";

class PostMessageIframeTransport extends Transport {
  public uri: string;
  public frame: undefined | null | Window;
  public postMessageID: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.postMessageID = `post-message-transport-${Math.random()}`;
  }
  public createWindow(uri: string): Promise<Window | null> {
    return new Promise((resolve, reject) => {
      let frame: Window | null;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("id", this.postMessageID);
      iframe.setAttribute("width", "0px");
      iframe.setAttribute("height", "0px");
      iframe.setAttribute("style", "visiblity:hidden;border:none;outline:none;");
      iframe.addEventListener("load", () => {
        resolve(frame);
      });
      iframe.setAttribute("src", uri);
      window.document.body.appendChild(iframe);
      frame = iframe.contentWindow;
    });
  }
  private messageHandler = (ev: MessageEvent) => {
    this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
  }
  public connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    return new Promise(async (resolve, reject) => {
      if (!urlRegex.test(this.uri)) {
        reject(new Error("Bad URI"));
      }
      this.frame = await this.createWindow(this.uri);
      window.addEventListener("message", this.messageHandler);
      resolve();
    });
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | null = 5000): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, null);
    const notifications = getNotifications(data);
    if (this.frame) {
      this.frame.postMessage((data as IJSONRPCData).request, "*");
      this.transportRequestManager.settlePendingRequest(notifications);
    }
    return prom;
  }

  public close(): void {
    const el = document.getElementById(this.postMessageID);
    el?.remove();
    window.removeEventListener("message", this.messageHandler);
  }

}

export default PostMessageIframeTransport;
