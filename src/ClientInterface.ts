import { IJSONRPCNotification } from "./Request.js";

interface Arguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface Options {
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

export type RequestArguments = Arguments;

export type NotificationArguments = Arguments;

export type JSONRPCMessage = RequestArguments | NotificationArguments;

export interface IClient {
  request(args: RequestArguments, options?: Options | number): Promise<unknown>;
  notify(args: NotificationArguments, options?: Options | number): Promise<unknown>;
  close(): void;
  onNotification(callback: (data: IJSONRPCNotification) => void): void;
}
