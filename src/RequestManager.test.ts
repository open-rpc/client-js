import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";

describe("client-js", () => {
  it("can be constructed", () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request("my_method", null).then).toEqual("function");
  });

  it("can connect", () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    return c.connect();
  });

  it("can close", () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    c.close();
  });

  it("can send a request", (done) => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    c.connect();
    transport.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.method).toEqual("foo");
      done();
    });
    c.request("foo", []);
  });

  it("can error on batchng a request", async () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    return c.connect().then(() => {
      expect(() => c.stopBatch()).toThrow();
    });
  });

  it("can return errors on batch requests", async () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    transport.sendData = (data) => {
      const result = JSON.stringify([
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
      ]);
      transport.connection.emit("message", result);
    };

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
    expect(requests[1]).resolves.toEqual("bar");
    c.stopBatch();
    c.close();
  });

  it("can batch a request", async () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    transport.sendData = (data) => {
      const result = JSON.stringify([
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
      ]);
      transport.connection.emit("message", result);
    };

    const c = new RequestManager([transport]);
    await c.connect();
    c.startBatch();
    const requests = [
      c.request("foo", []),
      c.request("foo", []),
    ];
    c.stopBatch();
    const [a, b] = await Promise.all(requests);
    expect(a).toEqual("foo");
    expect(b).toEqual("bar");
    c.close();
  });

  it("can send a request and error", async () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
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

});
