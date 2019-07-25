import ITransport from "./transports/Transport";

interface IJSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
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
  id: string | number; // can also be null
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
  private lastId: number = -1;

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
    const i = (++this.lastId).toString();
    return new Promise((resolve, reject) => {
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
    }).finally(() => this.requests[i] = undefined);
  }

  public close(): void {
    this.transports.forEach((transport) => {
      transport.close();
    });
  }

  /**
   * Begins a batch call by setting the [[RequestManager.batchStarted]] flag to `true`.
   *
   * [[RequestManager.batch]] is a singleton - only one batch can exist at a given time, per [[RequestManager]].
   *
   */
  public startBatch(): void {
    if (this.batchStarted) { return; }
    this.batchStarted = true;
  }

  public stopBatch(): void {
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
    const results = parsedData instanceof Array ? parsedData : [parsedData];

    results.forEach((response) => {
      const id = typeof response.id === "string" ? response.id : response.id.toString();
      const promiseForResult = this.requests[id];
      if (promiseForResult === undefined) {
        throw new Error(
          `Received an unrecognized response id: ${response.id}. Valid ids are: ${Object.keys(this.requests)}`,
        );
      }

      if (response.error) {
        promiseForResult.reject(response.error);
      } else if (response.result) {
        promiseForResult.resolve(response.result);
      } else {
        throw new Error(`Malformed JSON-RPC response object: ${response}`);
      }
    });
  }
}

export default RequestManager;
