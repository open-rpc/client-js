import { Transport } from "./Transport.js";
import {
  JSONRPCRequestData,
  IJSONRPCData,
  getNotifications,
} from "../Request.js";

const openPopup = (url: string) => {
  const width = 400;
  const height = window.screen.height;
  const left = 0;
  const top = 0;

  return window.open(
    url,
    "inspector:popup",
    `left=${left},top=${top},width=${width},height=${height},resizable,scrollbars=yes,status=1`,
  );
};

class PostMessageTransport extends Transport {
  public uri: string;
  public frame: undefined | null | Window;
  public postMessageID: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.postMessageID = `post-message-transport-${Math.random()}`;
  }

  public createWindow(uri: string): Promise<Window | null> {
    return new Promise((resolve, _reject) => {
      let frame: Window | null;
      frame = openPopup(uri);
      setTimeout(() => {
        resolve(frame);
      }, 3000);
    });
  }

  private messageHandler = (ev: MessageEvent) => {
    this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    if (!urlRegex.test(this.uri)) {
      throw new Error("Bad URI");
    }
    this.frame = await this.createWindow(this.uri);
    window.addEventListener("message", this.messageHandler);
  }

  public async sendData(
    data: JSONRPCRequestData,
    _timeout: number | undefined = 5000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, null);
    const notifications = getNotifications(data);
    if (this.frame) {
      this.frame.postMessage((data as IJSONRPCData).request, this.uri);
      this.transportRequestManager.settlePendingRequest(notifications);
    }
    return prom;
  }

  public close(): void {
    if (this.frame) {
      window.removeEventListener("message", this.messageHandler);
      (this.frame as Window).close();
    }
  }
}

export default PostMessageTransport;
