import Client from ".";
import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";

describe("client-js", () => {
  it("can be constructed", () => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request("my_method", null).then).toEqual("function");
  });

  it("has a notify method that returns a promise", () => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    expect(typeof c.request).toEqual("function");
    expect(typeof c.notify("my_method", null).then).toEqual("function");
  });

  it("can register error and subscription handlers", () => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    // tslint:disable-next-line:no-empty
    c.onError((err) => { });
    // tslint:disable-next-line:no-empty
    c.onNotification((data) => { });
  });

  describe("startBatch", () => {
    it("calls startBatch", () => {
      const emitter = new EventEmitter();
      const rm = new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
      const c = new Client(rm);
      c.startBatch();
      //      expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
    });
  });

  describe("can call stopBatch", () => {
    const emitter = new EventEmitter();
    const rm = new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
    const c = new Client(rm);
    c.startBatch();
    c.stopBatch();
  });

});
