import HTTPTransport from "./HTTPTransport";

describe("HTTPTransport", () => {
  it("can connect", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    return httpTransport.connect();
  });
  it("can close", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.close();
  });
  it("can send and receive data", (done) => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.connect().then(() => {
      httpTransport.sendData(JSON.stringify({foo: "bar"}));
    });
    httpTransport.onData((data: any) => {
      const d = JSON.parse(data);
      expect(d.foo).toEqual("bar");
      done();
    });
  });
  it("can send an error", (done) => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.connect().then(() => {
      httpTransport.onError(() => {
        done();
      });
      httpTransport.sendError(new Error("my custom error"));
    });
  });
  it("can send and handle error", (done) => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.connect().then(() => {
      httpTransport.sendData(JSON.stringify({foo: "error"}));
    });
    httpTransport.onData((data: string) => {
      const parsed = JSON.parse(data);
      expect(parsed.error.code).toEqual(-32000);
      done();
    });
  });
  it("can send and handle non error class error", (done) => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.connect().then(() => {
      httpTransport.sendData(JSON.stringify({foo: "non-error-class"}));
    });
    httpTransport.onData((data: string) => {
      const parsed = JSON.parse(data);
      expect(parsed.error.code).toEqual(-32000);
      done();
    });
  });
});
