import RequestManager from "./RequestManager";

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
