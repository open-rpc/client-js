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

  it("can send a request and error", () => {
    const transport = new EventEmitterTransport("foo://unique-uri");
    const c = new RequestManager([transport]);
    transport.onData = (fn) => {
      transport.connection.on("message", () => {
        fn(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
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
    expect(c.request("foo", [])).rejects.toThrow();
  });

});
