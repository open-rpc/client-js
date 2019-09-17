import fetch from "isomorphic-fetch";
import { Transport } from "./Transport";
import { JSONRPCRequestData, getNotifications, getBatchRequests } from "../Request";
import { ERR_UNKNOWN, JSONRPCError } from "../Error";
class HTTPTransport extends Transport {
  public uri: string;
  constructor(uri: string) {
    super();
    this.uri = uri;
  }
  public connect(): Promise<any> {
    return Promise.resolve();
  }

  public async sendData(data: JSONRPCRequestData, timeout?: number): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    const batch = getBatchRequests(data);
    try {
      const result = await fetch(this.uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.parseData(data)),
      });
      // requirements are that notifications are successfully sent
      this.transportRequestManager.settlePendingRequest(notifications);
      if (this.onlyNotifications(data)) {
        return Promise.resolve();
      }
      const body = await result.text();
      const responseErr = this.transportRequestManager.resolveResponse(body);
      if (responseErr) {
        // requirements are that batch requuests are successfully resolved
        // this ensures that individual requests within the batch request are settled
        this.transportRequestManager.settlePendingRequest(batch, responseErr);
        return Promise.reject(responseErr);
      }
    } catch (e) {
      const responseErr = new JSONRPCError(e.message, ERR_UNKNOWN, e);
      this.transportRequestManager.settlePendingRequest(notifications, responseErr);
      this.transportRequestManager.settlePendingRequest(getBatchRequests(data), responseErr);
      return Promise.reject(responseErr);
    }
    return prom;
  }

  // tslint:disable-next-line:no-empty
  public close(): void { }

  private onlyNotifications = (data: JSONRPCRequestData) => {
    if (data instanceof Array) {
      return data.every((datum) => datum.request.request.id === null || datum.request.request.id === undefined);
    }
    return (data.request.id === null || data.request.id === undefined);
  }

}

export default HTTPTransport;
