import RequestManager from "./RequestManager";
import { JSONRPCError } from "./Error";
import { IClient, RequestArguments, NotificationArguments } from "./ClientInterface";
import { IJSONRPCNotification } from "./Request";

/**
 * OpenRPC Client JS is a browser-compatible JSON-RPC client with multiple transports and
 * multiple request managers to enable features like round-robin or fallback-by-position.
 *
 * @example
 * ```typescript
 * import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
 * const transport = new HTTPTransport('http://localhost:3333');
 * const client = new Client(new RequestManager([transport]));
 * const result = await client.request({method: 'addition', params: [2, 2]});
 * // => { jsonrpc: '2.0', id: 1, result: 4 }
 * ```
 *
 */
class Client implements IClient {
  public requestManager: RequestManager;
  constructor(requestManager: RequestManager) {
    this.requestManager = requestManager;
  }

  /**
   * Initiates [[RequestManager.startBatch]] in order to build a batch call.
   *
   * Subsequent calls to [[Client.request]] will be added to the batch. Once [[Client.stopBatch]] is called, the
   * promises for the [[Client.request]] will then be resolved.  If the [[RequestManager]] already has a batch in
   * progress, this method is a noop.
   *
   * @example
   * myClient.startBatch();
   * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
   * myClient.request({method: "foo", params: ["baz"]}).then(() => console.log('foobaz'));
   * myClient.stopBatch();
   */
  public startBatch(): void {
    return this.requestManager.startBatch();
  }

  /**
   * Initiates [[RequestManager.stopBatch]] in order to finalize and send the batch to the underlying transport.
   *
   * [[Client.stopBatch]] will send the [[Client.request]] calls made since the last [[Client.startBatch]] call. For
   * that reason, [[Client.startBatch]] MUST be called before [[Client.stopBatch]].
   *
   * @example
   * myClient.startBatch();
   * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
   * myClient.request({method: "foo", params: ["baz"]}).then(() => console.log('foobaz'));
   * myClient.stopBatch();
   */
  public stopBatch(): void {
    return this.requestManager.stopBatch();
  }

  /**
   * A JSON-RPC call is represented by sending a Request object to a Server.
   *
   * @param requestObject.method A String containing the name of the method to be invoked. Method names that begin with the word rpc
   * followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and
   * MUST NOT be used for anything else.
   * @param requestObject.params A Structured value that holds the parameter values to be used during the invocation of the method.
   *
   * @example
   * myClient.request({method: "foo", params: ["bar"]}).then(() => console.log('foobar'));
   */
  public async request(requestObject: RequestArguments, timeout?: number) {
    if (this.requestManager.connectPromise) {
      await this.requestManager.connectPromise;
    }
    return this.requestManager.request(requestObject, false, timeout);
  }

  public async notify(requestObject: NotificationArguments) {
    if (this.requestManager.connectPromise) {
      await this.requestManager.connectPromise;
    }
    return this.requestManager.request(requestObject, true, null);
  }

  public onNotification(callback: (data: IJSONRPCNotification) => void) {
    this.requestManager.requestChannel.addListener("notification", callback);
  }

  public onError(callback: (data: JSONRPCError) => void) {
    this.requestManager.requestChannel.addListener("error", callback);
  }

  /**
   * Close connection
   */
  public close() {
    this.requestManager.close();
  }
}

export default Client;
