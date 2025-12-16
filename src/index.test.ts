import Client, {
  RequestManager,
  EventEmitterTransport,
  HTTPTransport,
  WebSocketTransport,
  PostMessageWindowTransport,
  PostMessageIframeTransport,
  JSONRPCError,
  AbortError,
} from "./index.js";
import { EventEmitter } from "events";
import { addMockServerTransport } from "./__mocks__/eventEmitter.js";
import { generateMockNotificationRequest } from "./__mocks__/requestData.js";

describe("client-js", () => {
  it("exposes the package exports", () => {
    expect(Client).toBeDefined();
    expect(RequestManager).toBeDefined();
    expect(EventEmitterTransport).toBeDefined();
    expect(HTTPTransport).toBeDefined();
    expect(WebSocketTransport).toBeDefined();
    expect(PostMessageWindowTransport).toBeDefined();
    expect(PostMessageIframeTransport).toBeDefined();
    expect(JSONRPCError).toBeDefined();
    expect(AbortError).toBeDefined();
  });

  it("can be constructed", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request({ method: "my_method" }).then).toEqual("function");
  });

  it("has a notify method that returns a promise", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    expect(typeof c.request).toEqual("function");
    expect(typeof c.notify({ method: "my_method" }).then).toEqual("function");
  });

  it("accepts an options object as second arg (timeout + signal)", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    const controller = new AbortController();
    const promiseLike = c.request({ method: "my_method" }, { timeout: 50, signal: controller.signal });
    expect(typeof (promiseLike as Promise<unknown>).then).toEqual("function");
  });

  it("accepts a numeric timeout as second arg for request and notify (backcompat)", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    const reqPromiseLike = c.request({ method: "my_method" }, 50);
    expect(typeof (reqPromiseLike as Promise<unknown>).then).toEqual("function");

    const notifyPromiseLike = c.notify({ method: "my_method" }, 50);
    expect(typeof (notifyPromiseLike as Promise<unknown>).then).toEqual("function");
  });

  it("can recieve notifications", (done) => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    addMockServerTransport(emitter, "from1", "to1://asdf/rpc-notification");
    c.onNotification(() => done());
    emitter.emit(
      "to1",
      JSON.stringify(generateMockNotificationRequest("foo", ["bar"])),
    );
  });

  it("can register error and subscription handlers", () => {
    const emitter = new EventEmitter();
    const c = new Client(
      new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]),
    );
    // tslint:disable-next-line:no-empty
    c.onError((_err) => {});
    // tslint:disable-next-line:no-empty
    c.onNotification((_data) => {});
  });

  describe("startBatch", () => {
    it("calls startBatch", () => {
      const emitter = new EventEmitter();
      const rm = new RequestManager([
        new EventEmitterTransport(emitter, "from1", "to1"),
      ]);
      const c = new Client(rm);
      c.startBatch();
      //      expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
    });
  });

  describe("can call stopBatch", () => {
    const emitter = new EventEmitter();
    const rm = new RequestManager([
      new EventEmitterTransport(emitter, "from1", "to1"),
    ]);
    const c = new Client(rm);
    c.startBatch();
    c.stopBatch();
  });

  describe("can close", () => {
    const emitter = new EventEmitter();
    const rm = new RequestManager([
      new EventEmitterTransport(emitter, "from1", "to1"),
    ]);
    const c = new Client(rm);
    c.close();
  });
});
