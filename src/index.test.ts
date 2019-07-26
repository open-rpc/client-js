import Client from ".";
import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";

jest.mock("./RequestManager");

const mockedRequestManager = RequestManager as jest.Mock<RequestManager>;
describe("client-js", () => {
  it("can be constructed", () => {
    const c = new Client(new RequestManager([new EventEmitterTransport("foo://unique")]));
    expect(!!c).toEqual(true);
  });

  it("has a request method that returns a promise", () => {
    const c = new Client(new RequestManager([new EventEmitterTransport("foo://unique")]));
    expect(typeof c.request).toEqual("function");
    expect(typeof c.request("my_method", null).then).toEqual("function");
  });

  describe("startBatch", () => {
    it("calls the requestManager.startBatch", () => {
      const rm = new mockedRequestManager([new EventEmitterTransport("foo://unique")]);
      const c = new Client(rm);
      c.startBatch();
      expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
    });
  });

  describe("stopBatch", () => {
    const rm = new RequestManager([new EventEmitterTransport("foo://unique")]);
    const c = new Client(rm);
    c.startBatch();
    c.stopBatch();
    expect(mockedRequestManager.mock.instances[0].startBatch).toHaveBeenCalled();
  });
});
