import { Transport } from "./Transport";
import { JSONRPCRequestData, IJSONRPCData } from "../Request";

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

type PostMessageType = "window" | "iframe";

class PostMessageTransport extends Transport {
  public uri: string;
  public frame: undefined | null | Window;
  public type: PostMessageType;
  public postMessageID: string;

  constructor(uri: string, type: PostMessageType) {
    super();
    this.type = type;
    this.uri = uri;
    this.postMessageID = `post-message-transport-${Math.random()}`;
  }
  public createWindow(uri: string): Promise<Window | null> {
    return new Promise((resolve, reject) => {
      let frame: Window | null;
      if (this.type === "window") {
        frame = openPopup(uri);
        setTimeout(() => {
          resolve(frame);
        }, 3000);
      } else {
        const iframe = document.createElement("iframe");
        iframe.addEventListener("load", () => {
          resolve(frame);
        });
        iframe.setAttribute("width", "0px");
        iframe.setAttribute("height", "0px");
        iframe.setAttribute("style", "visiblity:hidden;border:none;outline:none;");
        iframe.setAttribute("src", uri);
        iframe.setAttribute("id", this.postMessageID);
        window.document.body.appendChild(iframe);
        frame = iframe.contentWindow;
      }
    });
  }
  public connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    return new Promise(async (resolve, reject) => {
      if (!urlRegex.test(this.uri)) {
        reject(new Error("Bad URI"));
      }
      this.frame = await this.createWindow(this.uri);
      window.addEventListener("message", (ev: MessageEvent) => {
        if (ev.origin === window.origin) {
          return;
        }
        this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
      });
      resolve();
    });
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | undefined = 5000): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, undefined);
    if (this.frame) {
      this.frame.postMessage((data as IJSONRPCData).request, this.uri);
    }
    return prom;
  }

  public close(): void {
    if (this.type === "iframe") {
      const el = document.getElementById(this.postMessageID);
      el?.remove();
    } else if (this.frame) {
      (this.frame as Window).close();
    }
  }

}

export default PostMessageTransport;
