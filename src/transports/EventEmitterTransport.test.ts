import EventEmitterTransport from "./EventEmitterTransport";
import { EventEmitter } from "events";
import { generateMockRequest, generateMockNotificationRequest } from "../__mocks__/requestData";
import { addMockServerTransport } from "../__mocks__/eventEmitter";

describe("EventEmitterTransport", () => {

  it("can connect", async () => {
    const emitter = new EventEmitter();
    const eventEmitterTransport = new EventEmitterTransport(emitter, "foo://in", "foo://out");
    await eventEmitterTransport.connect();
  });

  it("can close", () => {
    const emitter = new EventEmitter();
    const reqUri = "from";
    const resUri = "to";
    const eventEmitterTransport = new EventEmitterTransport(emitter, reqUri, resUri);
    eventEmitterTransport.close();
  });

  it("can send and receive data", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "from1://asdf/rpc-request", "to1://asdf/rpc-response");
    const eventEmitterTransport = new EventEmitterTransport(emitter, "from1://asdf/rpc-request", "to1://asdf/rpc-response");
    await eventEmitterTransport.connect();
    const result = await eventEmitterTransport.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    });
    expect(result.method).toEqual("foo");
    expect(result.params).toEqual(["bar"]);
  });

  it("can send notifications", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "from1", "to1://asdf/rpc-notification");
    const eventEmitterTransport = new EventEmitterTransport(emitter, "from1", "to1://asdf/rpc-notification");
    await eventEmitterTransport.connect();
    const result = await eventEmitterTransport.sendData({
      request: generateMockNotificationRequest("foo", ["bar"]),
      internalID: 1,
    });
    expect(result).toEqual(undefined);
  });

  it("should throw error on bad response", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "from1", "to1://asdf/rpc-error");
    const eventEmitterTransport = new EventEmitterTransport(emitter, "from1", "to1://asdf/rpc-error");
    await eventEmitterTransport.connect();
    await expect(eventEmitterTransport.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    }))
      .rejects.toThrowError("Error message");
  });

  it("should throw error on bad protocol", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "from1", "to1://asdf/rpc-error");
    const eventEmitterTransport = new EventEmitterTransport(emitter, "from1", "to1://asdf/rpc-error");
    await eventEmitterTransport.connect();
    eventEmitterTransport.connection.emit = () => { throw new Error("failed protocol"); };
    await expect(eventEmitterTransport.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    }))
      .rejects.toThrowError("failed protocol");
  });

});
