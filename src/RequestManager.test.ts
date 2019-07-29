import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";
import { doesNotReject } from "assert";

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

  it("can send a request", (done) => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const serverTransport = new EventEmitterTransport(emitter, "to1", "from1");
    const c = new RequestManager([transport]);
    c.connect().then(() => {
      c.request("foo", []).then(() => {
        done();
      });
      serverTransport.sendData(JSON.stringify({ id: 0, result: { foo: "foofoo" } }));
    });
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
    return c.connect().then(() => {
      expect(() => c.stopBatch()).toThrow();
    });
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
