import {
  JSONRPCRequestData,
  IJSONRPCNotificationResponse,
  IJSONRPCResponse,
} from "../Request.js";

import { StrictEventEmitter } from "strict-event-emitter-types";
import { EventEmitter } from "events";
import { JSONRPCError } from "../Error.js";
import { TransportRequestManager } from "./TransportRequestManager.js";

interface ITransportEvents {
  pending: (data: JSONRPCRequestData) => void;
  notification: (data: IJSONRPCNotificationResponse) => void;
  response: (data: IJSONRPCResponse) => void;
  error: (data: JSONRPCError) => void;
}

type TransportEventName = keyof ITransportEvents;
export type TransportEventChannel = StrictEventEmitter<
  EventEmitter,
  ITransportEvents
>;

export abstract class Transport {
  protected transportRequestManager: TransportRequestManager;
  constructor() {
    this.transportRequestManager = new TransportRequestManager();
    // add a noop for the error event to not require handling the error event
    // tslint:disable-next-line:no-empty
    this.transportRequestManager.transportEventChannel.on("error", () => {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract connect(): Promise<any>;
  public abstract close(): void;
  public abstract sendData(
    data: JSONRPCRequestData,
    timeout?: number | null, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any>;

  public subscribe(
    event: TransportEventName,
    handler: ITransportEvents[TransportEventName],
  ) {
    this.transportRequestManager.transportEventChannel.addListener(
      event,
      handler,
    );
  }
  public unsubscribe(
    event?: TransportEventName,
    handler?: ITransportEvents[TransportEventName],
  ) {
    if (!event) {
      return this.transportRequestManager.transportEventChannel.removeAllListeners();
    }
    if (event && handler) {
      this.transportRequestManager.transportEventChannel.removeListener(
        event,
        handler,
      );
    }
  }
  protected parseData(data: JSONRPCRequestData) {
    if (data instanceof Array) {
      return data.map((batch) => batch.request.request);
    }
    return data.request;
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type promiseResolve = (r?: {} | PromiseLike<{}> | undefined) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export type TransportResponseData =
  | IHttpTransportResponse
  | IWSTransportResponse;
