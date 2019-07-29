import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";

describe("client-js", () => {
  it("can be constructed", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request("my_method", null).then).toEqual("function");
  });

  it("can connect", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    return c.connect();
  });

  it("can close", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    c.close();
  });

  it("can send a request", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    c.connect();
    transport.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
    c.request("foo", []);
    serverTransport.sendData(JSON.stringify({ foo: "bar" }));
  });

  it("can error on batchng a request", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    return c.connect().then(() => {
      expect(() => c.stopBatch()).toThrow();
    });
  });

  it("can return errors on batch requests", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");

    const c = new RequestManager([transport]);
    await c.connect();
    c.startBatch();
    const requests = [
      c.request("foo", []),
      c.request("foo", []),
    ];
    expect(requests[0]).rejects.toEqual({
      code: 509,
      message: "too much 509",
      data: {
        test: "data",
      },
    });
    serverTransport.sendData(JSON.stringify([
      {
        jsonrpc: "2.0",
        id: "0",
        error: {
          code: 509,
          message: "too much 509",
          data: {
            test: "data",
          },
        },
      },
      {
        jsonrpc: "2.0",
        id: "1",
        result: "bar",
      },
    ]));
    expect(requests[1]).resolves.toEqual("bar");
    c.stopBatch();
    c.close();
  });

  it("can batch a request", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");

    const c = new RequestManager([transport]);
    c.connect().then(() => {
      c.startBatch();
      const requests = [
        c.request("foo", []),
        c.request("foo", []),
      ];
      c.stopBatch();
      Promise.all(requests).then(([a, b]) => {
        expect(a).toEqual("foo");
        expect(b).toEqual("bar");
        c.close();
        done();
      });
      serverTransport.sendData(JSON.stringify([
        {
          jsonrpc: "2.0",
          id: 0,
          result: "foo",
        },
        {
          jsonrpc: "2.0",
          id: 1,
          result: "bar",
        },
      ]));
    });
  });

  it("can send a request and error", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    transport.onData = (fn) => {
      transport.connection.on("message", () => {
        fn(JSON.stringify({
          jsonrpc: "2.0",
          id: 7,
          error: {
            code: 0,
            message: "out of order",
            data: {
              foo: "bar",
            },
          },
        }));
      });
    };
    c.connect();
    expect(c.request("foo", [])).rejects.toBe({
      code: 0,
      message: "out of order",
      data: {
        foo: "bar",
      },
    });
  });

  describe("stopBatch", () => {
    it("does nothing if the batch is empty", () => {
      const emitter = new EventEmitter();
      const transport = new EventEmitterTransport(emitter, "from1", "to1");
      transport.sendData = jest.fn();
      const c = new RequestManager([transport]);
      c.startBatch();
      c.stopBatch();
      expect(transport.sendData).not.toHaveBeenCalled();
    });
  });
});
