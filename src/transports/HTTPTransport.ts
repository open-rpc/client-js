import fetch from "isomorphic-fetch";
import { Transport, HTTPTransportRequestOptions } from "./Transport";
import {
  JSONRPCRequestData,
  getNotifications,
  getBatchRequests,
} from "../Request";
import { ERR_UNKNOWN, JSONRPCError } from "../Error";

type CredentialsOption = "omit" | "same-origin" | "include";

interface HTTPTransportOptions {
  credentials?: CredentialsOption;
  headers?: Record<string, string>;
  fetcher?: typeof fetch;
  getQueryParamName?: string;
}

class HTTPTransport extends Transport {
  public uri: string;
  private readonly credentials?: CredentialsOption;
  private readonly headers: Headers;
  private readonly injectedFetcher?: typeof fetch;
  private readonly getQueryParamName: string;
  constructor(uri: string, options?: HTTPTransportOptions) {
    super();
    this.uri = uri;
    this.credentials = options && options.credentials;
    this.headers = HTTPTransport.setupHeaders(options && options.headers);
    this.injectedFetcher = options?.fetcher;
    this.getQueryParamName = (options && options?.getQueryParamName) || "query";
  }
  public connect(): Promise<any> {
    return Promise.resolve();
  }

  public async sendData(
    data: JSONRPCRequestData,
    timeout: number | null = null,
    requestOptions?: HTTPTransportRequestOptions,
  ): Promise<any> {
    if (requestOptions === undefined) {
      requestOptions = {method: "POST"};
    }
    const prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    const batch = getBatchRequests(data);
    const fetcher = this.injectedFetcher || fetch;
    try {
      const parsedData = JSON.stringify(this.parseData(data));
      let uri = this.uri;
      const params = {
        method: requestOptions.method,
        headers: this.headers,
        credentials: this.credentials,
      } as RequestInit;
      if (requestOptions.method === 'GET') {
        const q = new URLSearchParams();
        q.set(this.getQueryParamName, parsedData);
        uri += "?" + q.toString();
      }
      else {
        params.body = parsedData;
      }
      const result = await fetcher(uri, params);
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
      this.transportRequestManager.settlePendingRequest(
        notifications,
        responseErr
      );
      this.transportRequestManager.settlePendingRequest(
        getBatchRequests(data),
        responseErr
      );
      return Promise.reject(responseErr);
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
          datum.request.request.id === undefined
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
