import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import HTTPTransport from "./transports/HTTPTransport";
import WebSocketTransport from "./transports/WebSocketTransport";

interface IClient {
  request(method: string, params: any): Promise<any>;
}

class Client implements IClient {
  public requestManager: RequestManager;
  constructor(requestManager: RequestManager) {
    this.requestManager = requestManager;
  }
  public request(method: string, params: any) {
    return this.requestManager.request(method, params);
  }
}

export default Client;
export {
  Client,
  RequestManager,
  HTTPTransport,
  EventEmitterTransport,
  WebSocketTransport,
};
