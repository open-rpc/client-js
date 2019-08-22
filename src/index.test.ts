import Client from ".";
import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";

jest.mock("./RequestManager");

const mockedRequestManager = RequestManager as jest.Mock<RequestManager>;
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

  describe("startBatch", () => {
    it("calls the requestManager.startBatch", () => {
      const emitter = new EventEmitter();
      const rm = new mockedRequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
      const c = new Client(rm);
      c.startBatch();
      expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
    });
  });

  describe("stopBatch", () => {
    it("calls the requestManager.stopBatch", () => {
      const emitter = new EventEmitter();
      const rm = new mockedRequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
      const c = new Client(rm);
      c.startBatch();
      c.stopBatch();
      expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
    });
  });

  describe("onError", () => {
    it("should handle onerror", () => {
      const emitter = new EventEmitter();
      const rm = new mockedRequestManager([new EventEmitterTransport(emitter, "from1", "to1")]);
      const c = new Client(rm);
      c.onError(() => {
        // noop
      });
      expect(mockedRequestManager.mock.instances[0].onError).toHaveBeenCalled();
    });
  });
});
