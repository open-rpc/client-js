import { Transport } from "./transports/Transport";
import { IJSONRPCRequest, IJSONRPCNotification, IBatchRequest } from "./Request";
import { JSONRPCError } from "./Error";
import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { JSONRPCMessage } from "./ClientInterface";

export type RequestChannel = StrictEventEmitter<EventEmitter, IRequestEvents>;

export interface IRequestEvents {
  "error": (err: JSONRPCError) => void;
  "notification": (data: any) => void;
}
export type RequestID = string | number;

export type INextRequestID = () => RequestID;
export const defaultNextRequest = () => {
  let lastId = -1;
  return () => ++lastId;
}
/*
** Naive Request Manager, only use 1st transport.
 * A more complex request manager could try each transport.
 * If a transport fails, or times out, move on to the next.
 */

class RequestManager {
  public transports: Transport[];
  public connectPromise: Promise<any>;
  public batch: IBatchRequest[] = [];
  public requestChannel: RequestChannel;
  private requests: any;
  private batchStarted: boolean = false;
  private lastId: number = -1;
  private nextID: INextRequestID;

  constructor(transports: Transport[], nextID:INextRequestID = defaultNextRequest()) {
    this.transports = transports;
    this.requests = {};
    this.connectPromise = this.connect();
    this.requestChannel = new EventEmitter();
    this.nextID = nextID;
  }

  public connect(): Promise<any> {
    return Promise.all(this.transports.map(async (transport) => {
      transport.subscribe("error", this.handleError.bind(this));
      transport.subscribe("notification", this.handleNotification.bind(this));
      await transport.connect();
    }));
  }
  public getPrimaryTransport(): Transport {
    return this.transports[0];
  }

  public async request(requestObject: JSONRPCMessage, notification: boolean = false, timeout?: number | null): Promise<any> {
    const internalID = this.nextID().toString();
    const id = notification ? null : internalID;
    // naively grab first transport and use it
    const payload = {request: this.makeRequest(requestObject.method, requestObject.params || [], id) , internalID};
    if (this.batchStarted) {
      const result = new Promise((resolve, reject) => {
        this.batch.push({ resolve, reject, request: payload });
      });
      return result;
    }
    return this.getPrimaryTransport().sendData(payload, timeout);
  }

  public close(): void {
    this.requestChannel.removeAllListeners();
    this.transports.forEach((transport) => {
      transport.unsubscribe();
      transport.close();
    });
  }

  /**
   * Begins a batch call by setting the [[RequestManager.batchStarted]] flag to `true`.
   *
   * [[RequestManager.batch]] is a singleton - only one batch can exist at a given time, per [[RequestManager]].
   *
   */
  public startBatch(): void {
    this.batchStarted = true;
  }

  public stopBatch(): void {
    if (this.batchStarted === false) {
      throw new Error("cannot end that which has never started");
    }

    if (this.batch.length === 0) {
      this.batchStarted = false;
      return;
    }

    this.getPrimaryTransport().sendData(this.batch);
    this.batch = [];
    this.batchStarted = false;
  }

  private makeRequest( method: string,
                       params: any[] | object,
                       id?: number | string | null): IJSONRPCRequest | IJSONRPCNotification {
    if (id) {
      return { jsonrpc: "2.0", id, method, params };
    }
    return { jsonrpc: "2.0", method, params };
  }

  private handleError(data: JSONRPCError) {
    this.requestChannel.emit("error", data);
  }

  private handleNotification(data: any) {
    this.requestChannel.emit("notification", data);
  }

}

export default RequestManager;
