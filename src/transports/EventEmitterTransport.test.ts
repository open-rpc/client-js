import EventEmitterTransport from "./EventEmitterTransport";

describe("EventEmitterTransport", () => {
  it("can connect", () => {
    const eventEmitterTransport = new EventEmitterTransport("foo://bar");
    eventEmitterTransport.connect();
  });
  it("can close", () => {
    const eventEmitterTransport = new EventEmitterTransport("foo://bar");
    eventEmitterTransport.close();
  });
  it("can send and receive data", (done) => {
    const eventEmitterTransport = new EventEmitterTransport("foo://bar");
    eventEmitterTransport.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
    eventEmitterTransport.sendData(JSON.stringify({foo: "bar"}));
  });
});
