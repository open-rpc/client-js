import Client from ".";
import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";

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

});
