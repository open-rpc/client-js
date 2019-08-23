import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";
import HTTPTransport from "./transports/HTTPTransport";

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

  it("can connect", async () => {
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

  it("can send a request", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    await c.connect();
    const reqPromise = c.request("foo", []);
    serverTransport.sendData(JSON.stringify({ id: 0, result: { foo: "foofoo" } }));
    await expect(reqPromise).resolves.toEqual({ foo: "foofoo" });
  });

  it("can error on malformed response", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    c.connect().then(() => {
      c.request("foo", []).catch((e) => {
        expect(e.message).toContain("Malformed");
        done();
      });
      serverTransport.sendData(JSON.stringify({ id: 0, foo: "bar" }));
    });
  });

  it("can error on batchng a request", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    await c.connect();
    expect(() => c.stopBatch()).toThrow();
  });

  it("can return errors on batch requests", (done) => {
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
      Promise.all(requests).catch((e) => {
        expect(e).toEqual({
          code: 509,
          message: "too much 509",
          data: {
            test: "data",
          },
        });
        c.close();
        done();
      });
      c.stopBatch();
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

    });
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

  it("can send a request and error", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    c.connect().then(() => {
      c.request("foo", [])
        .catch((e) => {
          expect(e.message).toEqual("out of order");
          done();
        });
      serverTransport.sendData(JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        error: {
          code: 0,
          message: "out of order",
          data: {
            foo: "bar",
          },
        },
      }));
    });
  });

  it("onData throws if the ID is not found", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    c.connect().then(() => {
      c.onError((error) => {
        expect(error.message).toEqual("Received an unrecognized response id: 10. Valid ids are: ");
        done();
      });
      serverTransport.sendData(JSON.stringify({
        jsonrpc: "2.0",
        id: 10,
        result: 123,
      }));
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

  describe("startBatch", () => {
    it("it does nothing if a batch is already started", async () => {
      const emitter = new EventEmitter();
      const transport = new EventEmitterTransport(emitter, "from1", "to1");
      const c = new RequestManager([transport]);
      await c.connect();
      c.startBatch();
      c.request("foo", []);
      expect(c.batch.length).toBe(1);
      c.startBatch();
      c.request("foo", []);
      expect(c.batch.length).toBe(2);
    });
  });

  it("can handle onError from transport", (done) => {
    const transport = new HTTPTransport("http://localhost:8545");
    const c = new RequestManager([transport]);
    c.request("foo", ["non-error-class"]).catch(() => {
      done();
    });
  });
});
