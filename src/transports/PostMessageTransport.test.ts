window.postMessage = (message: any, targetOrigin: any) => {
  let data: any = {
    jsonrpc: "2.0",
    result: "bar",
    id: 0,
  };
  if (message.id === 1) {
    data = {
      jsonrpc: "2.0",
      error: {
        code: 32009,
        message: "Error message",
      },
      id: 1,
    }
  }
  if (message.id === 2) {
    data = {
      jsonrpc: "2.0",
      error: {
        code: 32009,
        message: "Random Segfault that crashes fetch",
      },
      id: 2,
    }
  }

  const event = new window.MessageEvent("message", {
    data,
  });
  event.initEvent("message", true, false);
  setTimeout(() => {
    window.dispatchEvent(event);
  }, 0);
};

import PostMessageTransport from "./PostMessageTransport";
import { generateMockRequest } from "../__mocks__/requestData";

window.open = () => {
  return window;
}

describe("PostMessageTransport", () => {

  it("can connect", () => {
    const wst = new PostMessageTransport("http://localhost:8545");
    return wst.connect();
  });

  it("can close", () => {
    const wst = new PostMessageTransport("http://localhost:8545");
    wst.close();
  });

  it("can send and receive data", async () => {
    const wst = new PostMessageTransport("http://localhost:8545/rpc-request");
    await wst.connect();
    const result = await wst.sendData({
      request: generateMockRequest(0, "foo", ["bar"]),
      internalID: 0
    });
    expect(result).toEqual("bar");
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("can send and receive data against potential timeout", async () => {
    const wst = new PostMessageTransport("http://localhost:8545/rpc-request");
    await wst.connect();
    const result = await wst.sendData({
      request: generateMockRequest(0, "foo", ["bar"]),
      internalID: 0
    }, 10000);
    expect(result).toEqual("bar");
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("can send and receive errors", async () => {
    const wst = new PostMessageTransport("http://localhost:8545/rpc-error");
    await wst.connect();
    await expect(wst.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    })).rejects.toThrowError("Error message");
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("can handle underlying transport crash", async () => {
    const wst = new PostMessageTransport("http://localhost:8545/crash");
    await wst.connect();
    await expect(wst.sendData({
      request: generateMockRequest(2, "foo", ["bar"]),
      internalID: 2,
    })).rejects.toThrowError("Random Segfault that crashes fetch");
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});
