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

class PostMessageWindowTransport extends Transport {
  public uri: string;
  public window: any;
  public frame: undefined | null | Window;

  constructor(uri: string) {
    super();
    this.uri = uri;
  }
  public connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    return new Promise((resolve, reject) => {
      if (!urlRegex.test(this.uri)) {
        reject(new Error("Bad URI"));
      }
      this.frame = openPopup(this.uri);
      window.addEventListener("message", (ev: MessageEvent) => {
        if (ev.origin === window.origin) {
          return;
        }
        this.transportRequestManager.resolveResponse(JSON.stringify(ev.data));
      });
      setTimeout(() => {
        resolve(true);
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
    if (this.frame) {
      this.frame.close();
    }
  }

}

export default PostMessageWindowTransport;
