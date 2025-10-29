import WS from "isomorphic-ws";
import { Transport } from "./Transport.js";
import {
  JSONRPCRequestData,
  getNotifications,
  getBatchRequests,
} from "../Request.js";
import { JSONRPCError, ERR_UNKNOWN } from "../Error.js";

interface Message {
  data: string;
}

class WebSocketTransport extends Transport {
  public connection: WS;
  public uri: string;

  constructor(uri: string) {
    super();
    this.uri = uri;
    this.connection = new WS(uri);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public connect(): Promise<any> {
    return new Promise((resolve, _reject) => {
      const cb = () => {
        this.connection.removeEventListener("open", cb);
        resolve(undefined);
      };
      this.connection.addEventListener("open", cb);
      this.connection.addEventListener("message", (message) => {
        const { data } = message as Message;
        this.transportRequestManager.resolveResponse(data);
        return;
      });
    });
  }

  public async sendData(
    data: JSONRPCRequestData,
    timeout: number | null = 5000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    let prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    try {
      this.connection.send(JSON.stringify(this.parseData(data)));
      this.transportRequestManager.settlePendingRequest(notifications);
    } catch (err) {
      const jsonError = new JSONRPCError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).message,
        ERR_UNKNOWN,
        err,
      );

      this.transportRequestManager.settlePendingRequest(
        notifications,
        jsonError,
      );
      this.transportRequestManager.settlePendingRequest(
        getBatchRequests(data),
        jsonError,
      );

      prom = Promise.reject(jsonError);
    }

    return prom;
  }

  public close(): void {
    this.connection.close();
  }
}

export default WebSocketTransport;
