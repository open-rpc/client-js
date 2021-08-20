import {
  JSONRPCRequestData, IJSONRPCRequest,
  IJSONRPCNotification, IJSONRPCNotificationResponse,
  IJSONRPCResponse, IBatchRequest, IJSONRPCData,
} from "../Request";
import { EventEmitter } from "events";
import { JSONRPCError, ERR_TIMEOUT, ERR_UNKNOWN, ERR_MISSIING_ID, convertJSONToRPCError } from "../Error";
import { promiseResolve, promiseReject, TransportEventChannel, TransportResponse, IRequestPromise } from "./Transport";
export interface IPendingRequest {
  resolve: promiseResolve;
  reject: promiseReject;
}
export class TransportRequestManager {
  public transportEventChannel: TransportEventChannel;
  private pendingRequest: {
    [id: string]: IPendingRequest;
  };
  private pendingBatchRequest: {
    [id: string]: boolean;
  };
  constructor() {
    this.pendingRequest = {};
    this.pendingBatchRequest = {};
    this.transportEventChannel = new EventEmitter();
  }
  public addRequest(data: JSONRPCRequestData, timeout: number | null): Promise<any> {
    this.transportEventChannel.emit("pending", data);
    if (data instanceof Array) {
      this.addBatchReq(data, timeout);
      return Promise.resolve();
    }
    return this.addReq(data.internalID, timeout);
  }

  public settlePendingRequest(request: IJSONRPCData[], error?: Error) {
    request.forEach((req) => {
      const resolver = this.pendingRequest[req.internalID];
      delete this.pendingBatchRequest[req.internalID];
      if (resolver === undefined) {
        return;
      }
      if (error) {
        resolver.reject(error);
        return;
      }
      resolver.resolve();
      // Notifications have no response and should clear their own pending requests
      if(req.request.id === null || req.request.id === undefined){
        delete this.pendingRequest[req.internalID];
      }
    });
  }

  public isPendingRequest(id: string | number): boolean {
    return this.pendingRequest.hasOwnProperty(id)
  }

  public resolveResponse(payload: string, emitError: boolean = true): TransportResponse {
    let data: any = payload;
    try {
      data = JSON.parse(payload);
      if (this.checkJSONRPC(data) === false) {
        return; // ignore messages that are not conforming to JSON-RPC
      }
      if (data instanceof Array) {
        return this.resolveBatch(data, emitError);
      }
      return this.resolveRes(data, emitError);
    } catch (e) {
      const err = new JSONRPCError("Bad response format", ERR_UNKNOWN, payload);
      if (emitError) {
        this.transportEventChannel.emit("error", err);
      }
      return err;
    }
  }

  private addBatchReq(batches: IBatchRequest[], timeout: number | null) {
    batches.forEach((batch) => {
      const { resolve, reject } = batch;
      const { internalID } = batch.request;
      this.pendingBatchRequest[internalID] = true;
      this.pendingRequest[internalID] = { resolve, reject };
    });
    return Promise.resolve();
  }
  private addReq(id: string | number, timeout: number | null) {
    return new Promise((resolve, reject) => {
      if (timeout !== null && timeout) {
        this.setRequestTimeout(id, timeout, reject);
      }
      this.pendingRequest[id] = { resolve, reject };
    });
  }
  private checkJSONRPC(data: any) {
    let payload = [data];
    if (data instanceof Array) {
      payload = data;
    }
    return payload.every((datum) => (datum.result !== undefined || datum.error !== undefined || datum.method !== undefined));
  }

  private processResult(payload: any, prom: IRequestPromise) {
    if (payload.error) {
      const err = convertJSONToRPCError(payload);
      prom.reject(err);
      return;
    }
    prom.resolve(payload.result);
  }
  private resolveBatch(payload: (IJSONRPCRequest | IJSONRPCNotification)[], emitError: boolean): TransportResponse {
    const results = payload.map((datum) => {
      return this.resolveRes(datum, emitError);
    });
    const errors = results.filter((result) => result);
    if (errors.length > 0) {
      return errors[0];
    }
    return undefined;
  }

  private resolveRes(data: IJSONRPCNotificationResponse | IJSONRPCResponse, emitError: boolean): TransportResponse {
    const { id, error } = data;

    const status = this.pendingRequest[id as string];
    if (status) {
      delete this.pendingRequest[id as string];
      this.processResult(data, status);
      this.transportEventChannel.emit("response", data as IJSONRPCResponse);
      return;
    }
    if (id === undefined && error === undefined) {
      this.transportEventChannel.emit("notification", data as IJSONRPCNotificationResponse);
      return;
    }
    let err;
    if (error) {
      err = convertJSONToRPCError(data);
    }
    if (emitError && error && err) {
      this.transportEventChannel.emit("error", err);
    }
    return err;
  }

  private setRequestTimeout(id: string | number, timeout: number, reject: promiseReject) {
    setTimeout(() => {
      delete this.pendingRequest[id];
      reject(new JSONRPCError(`Request timeout request took longer than ${timeout} ms to resolve`, ERR_TIMEOUT));
    }, timeout);
  }
}
