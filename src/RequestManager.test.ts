import RequestManager from "./RequestManager";
import EventEmitterTransport from "./transports/EventEmitterTransport";
import { EventEmitter } from "events";
import { addMockServerTransport } from "./__mocks__/eventEmitter";
import { JSONRPCError } from "./Error";

describe("client-js", () => {

  it("can be constructed and connect", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    expect(!!c).toEqual(true);
  });

  it("can close", () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    c.close();
  });

  it("can send a request", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-request", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-request");
    const c = new RequestManager([transport]);
    const result = await c.request("foo", ["bar"]);
    expect(result.method).toEqual("foo");
    expect(result.params).toEqual(["bar"]);
  });

  it("can error on error response", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-error", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-error");
    const c = new RequestManager([transport]);
    await expect(c.request("foo", ["bar"])).rejects.toThrowError("Error message");
    });

  it("can error on malformed response and recieve error", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-garbage", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-garbage");
    const c = new RequestManager([transport]);
    const unknownError = new Promise((resolve) => {
      c.requestChannel.on("error", (d) => {
        resolve(d);
      });
    });
    await expect(c.request("foo", ["bar"], false, 1000))
      .rejects.toThrowError("Request timeout request took longer than 1000 ms to resolve");
    const formatError = await unknownError as JSONRPCError;
    expect(formatError.message).toContain("Bad response format");
  });

  it("can error on batchng a request", async () => {
    const emitter = new EventEmitter();
    const transport = new EventEmitterTransport(emitter, "from1", "to1");
    const c = new RequestManager([transport]);
    expect(() => c.stopBatch()).toThrow();
  });

  it("can return errors on batch requests", async () => {
    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-error", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-error");

    const c = new RequestManager([transport]);
    c.startBatch();
    const requests = [
      c.request("foo", ["bar"]),
      c.request("foo", ["bar"]),
    ];
    c.stopBatch();
    await expect(Promise.all(requests)).rejects.toThrowError("Error message");
  });

  it("can batch a request", async () => {

    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-request", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-request");

    const c = new RequestManager([transport]);
    c.startBatch();
    const requests = [
        c.request("foo", []),
        c.request("foo", ["bar"]),
    ];
    c.stopBatch();
    const [a, b] = await Promise.all(requests);
    expect(a.method).toEqual("foo");
    expect(b.method).toEqual("foo");
    expect(a.params).toEqual([]);
    expect(b.params).toEqual(["bar"]);
  });

  it("can batch a notifications", async () => {

    const emitter = new EventEmitter();
    addMockServerTransport(emitter, "to1://local/rpc-request", "from1");
    const transport = new EventEmitterTransport(emitter, "from1", "to1://local/rpc-request");

    const c = new RequestManager([transport]);
    c.startBatch();
    const requests = [
        c.request("foo", [], true),
        c.request("foo", ["bar"], true),
    ];
    c.stopBatch();
    const [a, b] = await Promise.all(requests);
  });

  describe("stopBatch", () => {
    it("does nothing if the batch is empty", () => {
      const emitter = new EventEmitter();
      const transport = new EventEmitterTransport(emitter, "from1", "to1");
      transport.sendData = jest.fn();
      const c = new RequestManager([transport]);
      c.startBatch();
      c.stopBatch();
      expect(transport.sendData).not.toHaveBeenCalled();
    });
  });

  describe("startBatch", () => {
    it("it does nothing if a batch is already started", async () => {
      const emitter = new EventEmitter();
      const transport = new EventEmitterTransport(emitter, "from1", "to1");
      const c = new RequestManager([transport]);
      await c.connect();
      c.startBatch();
      c.request("foo", []);
      expect(c.batch.length).toBe(1);
      c.startBatch();
      c.request("foo", []);
      expect(c.batch.length).toBe(2);
    });
  });
});
