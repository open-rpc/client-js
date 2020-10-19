import { Client } from ".";
import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";
import { addMockServerTransport } from "./__mocks__/eventEmitter";
import { generateMockNotificationRequest } from "./__mocks__/requestData";

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
    expect(typeof c.request({ method: "my_method" }).then).toEqual("function");
  });

  it("has a notify method that returns a promise", () => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    expect(typeof c.request).toEqual("function");
    expect(typeof c.notify({ method: "my_method" }).then).toEqual("function");
  });

  it("can recieve notifications", (done) => {
    const emitter = new EventEmitter();
    const c = new Client(new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]));
    addMockServerTransport(emitter, "from1", "to1://asdf/rpc-notification");
    c.onNotification(() => done());
    emitter.emit("to1", JSON.stringify(generateMockNotificationRequest("foo", ["bar"])));
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

  describe("can close", () => {
    const emitter = new EventEmitter();
    const rm = new RequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
    const c = new Client(rm);
    c.close();
  });

});
