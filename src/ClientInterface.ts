import { IJSONRPCNotification } from "./Request";

interface Arguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export type RequestArguments = Arguments;

export type NotificationArguments = Arguments;

export type JSONRPCMessage = RequestArguments | NotificationArguments;

export interface IClient {
  request(args: RequestArguments): Promise<unknown>;
  notify(args: NotificationArguments): Promise<unknown>;
  close(): void;
  onNotification(callback: (data: IJSONRPCNotification) => void): void;
}
