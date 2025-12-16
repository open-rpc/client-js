import { EventEmitter } from "events";
import { Transport, TransportOptions } from "./Transport.js";
import { JSONRPCRequestData, getNotifications } from "../Request.js";
import { JSONRPCError, ERR_UNKNOWN } from "../Error.js";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public connect(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.connection.on(this.resUri, (data: any) => {
      this.transportRequestManager.resolveResponse(data);
    });
    return Promise.resolve();
  }

  public sendData(
    data: JSONRPCRequestData,
    options?: TransportOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
  const timeout = options?.timeout ?? null;
  const signal = options?.signal;
  const prom = this.transportRequestManager.addRequest(data, timeout, signal);
    const notifications = getNotifications(data);
    const parsedData = this.parseData(data);
    try {
      this.connection.emit(this.reqUri, parsedData);
      this.transportRequestManager.settlePendingRequest(notifications);
      return prom;
    } catch (e) {
      const error = e as Error;
      const responseErr = new JSONRPCError(error.message, ERR_UNKNOWN, error);
      this.transportRequestManager.settlePendingRequest(
        notifications,
        responseErr,
      );
      return Promise.reject(responseErr);
    }
  }

  public close() {
    this.connection.removeAllListeners();
  }
}

export default EventEmitterTransport;
