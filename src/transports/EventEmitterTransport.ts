import { EventEmitter } from "events";
import { Transport } from "./Transport";
import { JSONRPCRequestData, getNotifications } from "../Request";
import { JSONRPCError, ERR_UNKNOWN } from "../Error";

class EventEmitterTransport extends Transport {
  public connection: EventEmitter;
  private reqUri: string;
  private resUri: string;

  constructor(destEmitter: EventEmitter, reqUri: string, resUri: string) {
    super();
    this.connection = destEmitter;
    this.reqUri = reqUri;
    this.resUri = resUri;
  }

  public connect(): Promise<any> {
    this.connection.on(this.resUri, (data: any) => {
      this.transportRequestManager.resolveResponse(data);
    });
    return Promise.resolve();
  }

  public sendData(data: JSONRPCRequestData, timeout: number | null = null): Promise<any> {
    const prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    const parsedData = this.parseData(data);
    try {
      this.connection.emit(this.reqUri, parsedData);
      this.transportRequestManager.settlePendingRequest(notifications);
      return prom;
    } catch (e) {
      const responseErr = new JSONRPCError(e.message, ERR_UNKNOWN, e);
      this.transportRequestManager.settlePendingRequest(notifications, responseErr);
      return Promise.reject(responseErr);
    }
  }

  public close() {
    this.connection.removeAllListeners();
  }
}

export default EventEmitterTransport;
