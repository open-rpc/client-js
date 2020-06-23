import PostMessageTransport from "./PostMessageIframeTransport";
import { generateMockRequest } from "../__mocks__/requestData";
import handler from "serve-handler";
import http from "http";


let server: http.Server | undefined;

beforeAll(() => {
  server = http.createServer((request, response) => {
    return handler(request, response, {
      public: "src/testiframe",
    });
  });
  server.listen(5000);
});


afterAll(() => {
  if (server) {
    server.close();
  }
})
describe("PostMessageTransport", () => {

  describe("iframe", () => {
    it("can connect", () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      return pmt.connect();
    });

    it("can error connect with bad uri", () => {
      const pmt = new PostMessageTransport("foo://localhost:5000/iframe.html");
      expect(pmt.connect()).rejects.toThrowError("Bad URI");
    });

    it("can close", () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      pmt.close();
    });

    it("can send and receive data", async () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      await pmt.connect();
      const result = await pmt.sendData({
        request: generateMockRequest(0, "foo", ["bar"]),
        internalID: 0
      })
      expect(result).toEqual("bar");
    });

    it("can send and receive data against potential timeout", async () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      await pmt.connect();
      const result = await pmt.sendData({
        request: generateMockRequest(0, "foo", ["bar"]),
        internalID: 0
      }, 10000);
      expect(result).toEqual("bar");
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("can send and receive errors", async () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      await pmt.connect();
      await expect(pmt.sendData({
        request: generateMockRequest(1, "foo", ["bar"]),
        internalID: 1,
      })).rejects.toThrowError("Error message");
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("can handle underlying transport crash", async () => {
      const pmt = new PostMessageTransport("http://localhost:5000/iframe.html");
      await pmt.connect();
      await expect(pmt.sendData({
        request: generateMockRequest(2, "foo", ["bar"]),
        internalID: 2,
      })).rejects.toThrowError("Random Segfault that crashes fetch");
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

  })

});
