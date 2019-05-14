import ITransport from "./transports/Transport";
let id = 1;

/*
** Naive Request Manager, only use 1st transport.
 * A more complex request manager could try each transport.
 * If a transport fails, or times out, move on to the next.
 */
class RequestManager {
  public transports: ITransport[];
  private requests: any;
  private connectPromise: Promise<any>;
  constructor(transports: ITransport[]) {
    this.transports = transports;
    this.requests = {};
    this.connectPromise = this.connect();
  }
  public connect() {
    const promises = this.transports.map((transport) => {
      return new Promise(async (resolve, reject) => {
        await transport.connect();
        transport.onData((data: any) => {
          this.onData(data);
        });
        resolve();
      });
    });
    return Promise.all(promises);
  }
  public onData(data: string) {
    const parsedData = JSON.parse(data);
    if (typeof parsedData.result === "undefined") {
      return;
    }
    // call request callback for id
    this.requests[parsedData.id](parsedData);
    delete this.requests[parsedData.id];
  }
  public async request(method: string, params: any): Promise<any> {
    await this.connectPromise;
    return new Promise((resolve, reject) => {
      const i = id++;
      // naively grab first transport and use it
      const transport = this.transports[0];
      this.requests[i] = resolve;
      transport.sendData(JSON.stringify({
        jsonrpc: "2.0",
        id: i,
        method,
        params,
      }));
    });
  }
  public close() {
    this.transports.forEach((transport) => {
      transport.close();
    });
  }
}

export default RequestManager;
