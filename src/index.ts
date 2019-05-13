
interface IClient {
  request(method: string, params: any): Promise<any>;
}

class Client implements IClient {
  public request(method: string, params: any) {
    return new Promise(() => {/* */});
  }
}

export default Client;
