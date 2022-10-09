import WS from "isomorphic-ws";
import { Transport } from "./Transport";
import { JSONRPCRequestData, getNotifications, getBatchRequests } from "../Request";
import { JSONRPCError, ERR_UNKNOWN } from "../Error";

class WebSocketTransport extends Transport {
  public connection: WS;
  public uri: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.connection = new WS(uri);
  }
  public connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cb = () => {
        this.connection.removeEventListener("open", cb);
        resolve();
      };
      this.connection.addEventListener("open", cb);
      this.connection.addEventListener("message", (message: { data: string }) => {
        const { data } = message;
        this.transportRequestManager.resolveResponse(data);
      });
    });
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | null = 5000): Promise<any> {
    let prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    try {
      this.connection.send(JSON.stringify(this.parseData(data)));
      this.transportRequestManager.settlePendingRequest(notifications);
    } catch (err) {
      const jsonError = new JSONRPCError((err as any).message, ERR_UNKNOWN, err);

      this.transportRequestManager.settlePendingRequest(notifications, jsonError);
      this.transportRequestManager.settlePendingRequest(getBatchRequests(data), jsonError);

      prom = Promise.reject(jsonError);
    }

    return prom;
  }

  public close(): void {
    this.connection.close();
  }
}

export default WebSocketTransport;
