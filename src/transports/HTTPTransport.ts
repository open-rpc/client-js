import { Transport, TransportOptions } from "./Transport.js";
import {
  JSONRPCRequestData,
  getNotifications,
  getBatchRequests,
} from "../Request.js";
import { ERR_UNKNOWN, JSONRPCError } from "../Error.js";

type CredentialsOption = "omit" | "same-origin" | "include";

interface HTTPTransportOptions {
  credentials?: CredentialsOption;
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
}

class HTTPTransport extends Transport {
  public uri: string;
  private readonly credentials?: CredentialsOption;
  private readonly headers: Headers;
  private readonly injectedFetcher?: typeof fetch;
  constructor(uri: string, options?: HTTPTransportOptions) {
    super();
    this.uri = uri;
    this.credentials = options && options.credentials;
    this.headers = HTTPTransport.setupHeaders(options && options.headers);
    this.injectedFetcher = options?.fetcher;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public connect(): Promise<any> {
    return Promise.resolve();
  }

  public async sendData(
    data: JSONRPCRequestData,
    options?: TransportOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
  const timeout = options?.timeout ?? null;
  const signal = options?.signal;
  const prom = this.transportRequestManager.addRequest(data, timeout, signal);
    const notifications = getNotifications(data);
    const batch = getBatchRequests(data);
    const fetcher = this.injectedFetcher || fetch;
    try {
      const result = await fetcher(this.uri, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(this.parseData(data)),
        credentials: this.credentials,
        signal,
      });
      // requirements are that notifications are successfully sent
      this.transportRequestManager.settlePendingRequest(notifications);
      if (this.onlyNotifications(data)) {
        return Promise.resolve();
      }
      const body = await result.text();
      const responseErr = this.transportRequestManager.resolveResponse(body);
      if (responseErr) {
        // requirements are that batch requests are successfully resolved
        // this ensures that individual requests within the batch request are settled
        this.transportRequestManager.settlePendingRequest(batch, responseErr);
        return Promise.reject(responseErr);
      }
    } catch (e) {
      const error = e as Error;
      const responseErr = new JSONRPCError(error.message, ERR_UNKNOWN, error);
      // requirements are that notifications are successfully resolved
      this.transportRequestManager.settlePendingRequest(
        notifications,
        responseErr,
      );
      // requirements are that batch requests are successfully resolved
      this.transportRequestManager.settlePendingRequest(
        getBatchRequests(data),
        responseErr,
      );
      // requirements are that individual requests are successfully resolved
      if (!Array.isArray(data)) {
        this.transportRequestManager.settlePendingRequest([data], responseErr);
      }
    }
    return prom;
  }

  // tslint:disable-next-line:no-empty
  public close(): void {}

  private onlyNotifications = (data: JSONRPCRequestData) => {
    if (data instanceof Array) {
      return data.every(
        (datum) =>
          datum.request.request.id === null ||
          datum.request.request.id === undefined,
      );
    }
    return data.request.id === null || data.request.id === undefined;
  };

  private static setupHeaders(headerOptions?: Record<string, string>): Headers {
    const headers = new Headers(headerOptions);
    // Overwrite header options to ensure correct content type.
    headers.set("Content-Type", "application/json");
    return headers;
  }
}

export default HTTPTransport;
export { HTTPTransport, HTTPTransportOptions, CredentialsOption };
