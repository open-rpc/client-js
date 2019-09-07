import WebSocketTransport from "./WebSocketTransport";
import { generateMockRequest } from "../__mocks__/requestData";

describe("WebSocketTransport", () => {

  it("can connect", () => {
    const wst = new WebSocketTransport("http://localhost:8545");
    return wst.connect();
  });

  it("can close", () => {
    const wst = new WebSocketTransport("http://localhost:8545");
    wst.close();
  });

  it("can send and receive data", async () => {
    const wst = new WebSocketTransport("http://localhost:8545/rpc-request");
    await wst.connect();
    const result = await wst.sendData({ request: generateMockRequest(1, "foo", ["bar"]), internalID: 1 });
    expect(result.method).toEqual("foo");
    expect(result.params).toEqual(["bar"]);
  });

  it("can send and receive data against potential timeout", async () => {
    const wst = new WebSocketTransport("http://localhost:8545/rpc-request");
    await wst.connect();
    const result = await wst.sendData({ request: generateMockRequest(1, "foo", ["bar"]), internalID: 1 }, 10000);
    expect(result.method).toEqual("foo");
    expect(result.params).toEqual(["bar"]);
  });

  it("can send and receive errors", async () => {
    const wst = new WebSocketTransport("http://localhost:8545/rpc-error");
    await wst.connect();
    await expect(wst.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    })).rejects.toThrowError("Error message");
  });

  it("can handle underlying transport crash", async () => {
    const wst = new WebSocketTransport("http://localhost:8545/crash");
    await wst.connect();
    await expect(wst.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    })).rejects.toThrowError("Random Segfault that crashes fetch");
  });
});
