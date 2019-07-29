import EventEmitterTransport from "./EventEmitterTransport";
import { EventEmitter } from "events";

describe("EventEmitterTransport", () => {
  it("can connect", () => {
    const emitter = new EventEmitter();
    const eventEmitterTransport = new EventEmitterTransport(emitter, "foo://in", "foo://out");
    eventEmitterTransport.connect();
  });
  it("can close", () => {
    const emitter = new EventEmitter();
    const reqUri = "from";
    const resUri = "to";
    const eventEmitterTransport = new EventEmitterTransport(emitter, reqUri, resUri);
    eventEmitterTransport.close();
  });
  it("can send and receive data", (done) => {
    const emitter = new EventEmitter();
    const eventEmitterTransport = new EventEmitterTransport(emitter, "from1", "to1");
    eventEmitterTransport.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });

    const eventEmitterServerTransport = new EventEmitterTransport(emitter, "to1", "from1");
    eventEmitterServerTransport.sendData(JSON.stringify({foo: "bar"}));
  });
});
