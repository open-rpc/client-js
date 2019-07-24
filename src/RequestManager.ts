import ITransport from "./transports/Transport";

let id = 1;

interface IJSONRPCRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: any[] | object;
}
interface IJSONRPCError {
  code: number;
  message: string;
  data: any;
}

interface IJSONRPCResponse {
  jsonrpc: "2.0";
  id: number;
  result?: any;
  error?: IJSONRPCError;
}

interface IJSONRPCNotification {
  jsonrpc: "2.0";
  method: string;
  params: any[] | object;
}

/*
** Naive Request Manager, only use 1st transport.
 * A more complex request manager could try each transport.
 * If a transport fails, or times out, move on to the next.
 */
class RequestManager {
  public transports: ITransport[];
  public connectPromise: Promise<any>;
  private requests: any;
  private batchStarted: boolean = false;
  private batch: IJSONRPCRequest[] = [];

  constructor(transports: ITransport[]) {
    this.transports = transports;
    this.requests = {};
    this.connectPromise = this.connect();
  }

  public connect(): Promise<any> {
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

  public async request(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const i = id++;
      // naively grab first transport and use it
      const transport = this.transports[0];
      this.requests[i] = {
        resolve,
        reject,
      };
      const payload: IJSONRPCRequest = {
        jsonrpc: "2.0",
        id: i,
        method,
        params,
      };
      if (this.batchStarted) {
        this.batch.push(payload);
      } else {
        transport.sendData(JSON.stringify(payload));
      }
    });
  }

  public close(): void {
    this.transports.forEach((transport) => {
      transport.close();
    });
  }

  /**
   *
   */
  public startBatch(): void {
    if (this.batchStarted) { return; }
    this.batchStarted = true;
  }

  /**
   *
   */
  public endBatch(): void {
    if (this.batchStarted === false) {
      throw new Error("cannot end that which has never started");
    }

    if (this.batch.length === 0) {
      return;
    }

    const batch = JSON.stringify(this.batch);
    this.batch = [];
    this.transports[0].sendData(batch);
  }

  private onData(data: string): void {
    const parsedData: IJSONRPCResponse[] | IJSONRPCResponse = JSON.parse(data);
    if (Array.isArray(parsedData)) {
      parsedData.forEach((response) => {
        if (this.requests[response.id]) {
          if (response.error) {
            this.requests[response.id].reject(new Error(response.error.message));
          } else {
            this.requests[response.id].resolve(response.result);
          }
        }
      });
      return;
    }
    if (typeof parsedData.result === "undefined" && typeof parsedData.error === "undefined") {
      return;
    }
    const req = this.requests[parsedData.id];
    if (req === undefined) {
      return;
    }
    // resolve promise for id
    if (parsedData.error) {
      req.reject(parsedData.error);
    } else {
      req.resolve(parsedData.result);
    }
    delete this.requests[parsedData.id];
  }
}

export default RequestManager;
