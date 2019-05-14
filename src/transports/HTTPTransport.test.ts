import HTTPTransport from "./HTTPTransport";

describe("HTTPTransport", () => {
  it("can connect", () => {
    const wst = new HTTPTransport("http://localhost:8545");
    return wst.connect();
  });
  it("can close", () => {
    const wst = new HTTPTransport("http://localhost:8545");
    wst.close();
  });
  it("can send and receive data", (done) => {
    const wst = new HTTPTransport("http://localhost:8545");
    wst.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
    wst.sendData(JSON.stringify({foo: "bar"}));
  });
});
