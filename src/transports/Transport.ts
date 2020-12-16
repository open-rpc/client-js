import {
  JSONRPCRequestData,
  IJSONRPCNotificationResponse,
  IJSONRPCResponse,
} from "../Request";

import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { JSONRPCError } from "../Error";
import { TransportRequestManager } from "./TransportRequestManager";

interface ITransportEvents {
  pending: (data: JSONRPCRequestData) => void;
  notification: (data: IJSONRPCNotificationResponse) => void;
  response: (data: IJSONRPCResponse) => void;
  error: (data: JSONRPCError) => void;
}

type TransportEventName = keyof ITransportEvents;
export type TransportEventChannel = StrictEventEmitter<EventEmitter, ITransportEvents>;

export abstract class Transport {
  protected transportRequestManager: TransportRequestManager;
  constructor() {
    this.transportRequestManager = new TransportRequestManager();
    // add a noop for the error event to not require handling the error event
    // tslint:disable-next-line:no-empty
    this.transportRequestManager.transportEventChannel.on("error", () => { });
  }

  public abstract connect(): Promise<any>;
  public abstract close(): void;
  public abstract async sendData(data: JSONRPCRequestData, timeout?: number | null): Promise<any>;

  public subscribe(event: TransportEventName, handler: ITransportEvents[TransportEventName]) {
    this.transportRequestManager.transportEventChannel.addListener(event, handler);
  }
  public unsubscribe(event?: TransportEventName, handler?: ITransportEvents[TransportEventName]) {
    if (!event) {
      return this.transportRequestManager.transportEventChannel.removeAllListeners();
    }
    if (event && handler) {
      this.transportRequestManager.transportEventChannel.removeListener(event, handler);
    }
  }
  protected parseData(data: JSONRPCRequestData) {
    if (data instanceof Array) {
      return data.map((batch) => batch.request.request);
    }
    return data.request;
  }
}

export type promiseResolve = (r?: {} | PromiseLike<{}> | undefined) => void;
export type promiseReject = (r?: any) => void;
export interface IRequestPromise {
  resolve: promiseResolve;
  reject: promiseReject;
}

export type NotificationResponse = "notification";
export type RequestResponse = "response";
export type BadResponse = "error";

export type TransportResponse = JSONRPCError | undefined;

interface IHttpTransportResponse {
  type: "http";
  id?: string | number;
  error?: Error;
  payload: string;
}

interface IWSTransportResponse {
  type: "ws";
  payload: string;
}

export type TransportResponseData = IHttpTransportResponse | IWSTransportResponse;
