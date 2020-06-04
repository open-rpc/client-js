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

class PostMessageWindowTransport extends Transport {
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
  public connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    return new Promise((resolve, reject) => {
      let resolved = false;
      if (!urlRegex.test(this.uri)) {
        reject(new Error("Bad URI"));
      }
      if (this.type === "window") {
        this.frame = openPopup(this.uri);
      } else {
        const frame = document.createElement("iframe");
        frame.addEventListener("load", () => {
          resolved = true;
          resolve();
        });
        frame.setAttribute("width", "0px");
        frame.setAttribute("height", "0px");
        frame.setAttribute("style", "visiblity:hidden;border:none;outline:none;");
        frame.setAttribute("src", this.uri);
        frame.setAttribute("id", this.postMessageID);
        const el = document.getElementById("root");
        el?.parentNode?.insertBefore(frame, el);
        this.frame = frame.contentWindow;
      }
      window.addEventListener("message", (ev: MessageEvent) => {
        if (ev.origin === window.origin) {
          return;
        }
        this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
      });
      setTimeout(() => {
        if (!resolved) {
          resolve(true);
        }
      }, 3000);
    });
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | undefined = 5000): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, undefined);
    if (!this.frame) {
      return;
    }
    this.frame.postMessage((data as IJSONRPCData).request, this.uri);
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

export default PostMessageWindowTransport;
