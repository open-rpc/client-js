import WebSocketTransport from "./WebSocketTransport";

describe("WebSocketTransport", () => {
  it("can connect", () => {
    const wst = new WebSocketTransport("http://localhost:8545");
    return wst.connect();
  });
  it("can close", () => {
    const wst = new WebSocketTransport("http://localhost:8545");
    wst.close();
  });
  it("can send and receive data", (done) => {
    const wst = new WebSocketTransport("http://localhost:8545");
    wst.connect().then(() => {
      wst.sendData(JSON.stringify({ foo: "bar" }));
    });
    wst.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
  });
  it("can handle multiple onData callbacks", (done) => {
    const wst = new WebSocketTransport("http://localhost:8545");
    wst.connect().then(() => {
      wst.sendData(JSON.stringify({ foo: "bar" }));
    });
    wst.onData(() => {
      // noop
    });
    wst.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
  });
});
