import { HTTPTransport, HTTPTransportOptions } from "./HTTPTransport.js";
import * as reqMocks from "../__mocks__/requestData.js";
import { AbortError } from "../Error.js";

describe("HTTPTransport", () => {
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = jest.fn();
    // Setup default mock behavior
    mockFetch.mockImplementation(
      (url: string | URL | Request, options?: RequestInit) => {
        const urlStr = url.toString();

        if (urlStr.match(/crash/)) {
          throw new Error("Random Segfault that crashes fetch");
        }

        const body = options?.body as string;
        const responseText = reqMocks.generateMockResponseData(urlStr, body);

        return Promise.resolve({
          text: () => Promise.resolve(responseText),
        } as Response);
      },
    );
  });

  it("can subscribe", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.subscribe("error", () => {});
  });
  it("can unsubscribe", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    const handler = () => {};
    httpTransport.subscribe("error", handler);
    httpTransport.unsubscribe("error", handler);
  });

  it("can connect", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    return httpTransport.connect();
  });

  it("can close", () => {
    const httpTransport = new HTTPTransport("http://localhost:8545");
    httpTransport.close();
  });

  it("can send and retrieve request data", async () => {
    const httpTransport = new HTTPTransport(
      "http://localhost:8545/rpc-request",
      { fetcher: mockFetch },
    );
    const data = reqMocks.generateMockRequest(1, "foo", ["bar"]);
    const result = await httpTransport.sendData({
      request: data,
      internalID: 1,
    });
    expect(result.method).toEqual("foo");
    expect(result.params).toEqual(["bar"]);
  });

  it("can send notification data", async () => {
    const httpTransport = new HTTPTransport(
      "http://localhost:8545/rpc-notification",
      { fetcher: mockFetch },
    );
    const data = reqMocks.generateMockNotificationRequest("foo", ["bar"]);
    const result = await httpTransport.sendData({
      request: data,
      internalID: 1,
    });
    expect(result).toEqual(undefined);
  });

  it("should throw error on error response", async () => {
    const httpTransport = new HTTPTransport("http://localhost:8545/rpc-error", {
      fetcher: mockFetch,
    });
    const data = reqMocks.generateMockRequest(9, "foo", ["bar"]);
    await expect(
      httpTransport.sendData({ request: data, internalID: 9 }),
    ).rejects.toThrowError("Error message");
  });

  it("should throw error on bad data response", async () => {
    const httpTransport = new HTTPTransport(
      "http://localhost:8545/rpc-garbage",
      { fetcher: mockFetch },
    );
    const data = {
      request: reqMocks.generateMockRequest(9, "foo", ["bar"]),
      internalID: 9,
    };
    await expect(httpTransport.sendData(data)).rejects.toThrowError(
      "Bad response format",
    );
  });

  it("should throw error on bad data response from a batch", async () => {
    const httpTransport = new HTTPTransport(
      "http://localhost:8545/rpc-garbage",
      { fetcher: mockFetch },
    );
    const data = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve: (_d: any) => ({}),
      reject: (e: Error) => {
        expect(e.message).toContain("Bad response format");
      },
      request: {
        request: reqMocks.generateMockRequest(9, "foo", ["bar"]),
        internalID: 9,
      },
    };
    await expect(httpTransport.sendData([data])).rejects.toThrow(
      "Bad response format",
    );
  });

  it("should throw error if unknown server crash", async () => {
    const httpTransport = new HTTPTransport("http://localhost:8545/crash", {
      fetcher: mockFetch,
    });
    const data = {
      request: reqMocks.generateMockRequest(9, "foo", ["bar"]),
      internalID: 9,
    };
    await expect(httpTransport.sendData(data)).rejects.toThrowError(
      "Random Segfault that crashes fetch",
    );
  });

  async function callFetch(options?: HTTPTransportOptions): Promise<void> {
    const httpTransport = new HTTPTransport("http://localhost:8545", {
      ...options,
      fetcher: mockFetch,
    });
    const data = reqMocks.generateMockRequest(1, "foo", ["bar"]);
    await httpTransport.sendData({ request: data, internalID: 1 });
  }

  it("sets content type to application/json", async () => {
    await callFetch({ headers: { "Content-Type": "image/png" } });
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("Content-Type")).toEqual("application/json");
  });

  it("sets header passed from options", async () => {
    const headerName = "Authorization";
    const headerValue = "Basic credentials";
    await callFetch({ headers: { [headerName]: headerValue } });
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get(headerName)).toEqual(headerValue);
  });

  it("sets credentials argument passed from options", async () => {
    const credentials = "include";
    await callFetch({ credentials });
    expect(mockFetch.mock.calls[0][1]?.credentials).toEqual(credentials);
  });

  it("accepts an injected fetcher", async () => {
    const injectedFetchMock = jest.fn().mockImplementation(mockFetch);

    const httpTransport = new HTTPTransport(
      "http://localhost:8545/rpc-notification",
      {
        fetcher: injectedFetchMock,
      },
    );
    const data = reqMocks.generateMockNotificationRequest("foo", ["bar"]);
    const result = await httpTransport.sendData({
      request: data,
      internalID: 1,
    });
    expect(injectedFetchMock.mock.calls.length).toEqual(1);
    expect(result).toEqual(undefined);
  });

  it("should use global fetch if no fetcher provided", async () => {
    const globalFetch = jest.fn().mockImplementation((url, options) => {
      const body = options?.body as string;
      const responseText = reqMocks.generateMockResponseData(url.toString(), body);
      return Promise.resolve({
        text: () => Promise.resolve(responseText),
      });
    }) as any;
    global.fetch = globalFetch;

    const httpTransport = new HTTPTransport("http://localhost:8545/rpc-request");
    await httpTransport.sendData({
      request: reqMocks.generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    });

    expect(globalFetch).toHaveBeenCalled();
  });

  it("should abort the fetch request when signal is aborted", async () => {
    const controller = new AbortController();
    const httpTransport = new HTTPTransport("http://localhost:8545", {
      fetcher: mockFetch,
    });
    const data = reqMocks.generateMockRequest(1, "foo", ["bar"]);

    // Setup mock to fail if aborted (simulating fetch behavior)
    mockFetch.mockImplementation(async (_url, options) => {
      if (options?.signal?.aborted) {
        throw new DOMException("The user aborted a request.", "AbortError");
      }
      return new Promise((_, reject) => {
        options?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The user aborted a request.", "AbortError"));
        });
      });
    });

    const prom = httpTransport.sendData({
      request: data,
      internalID: 1,
    }, { timeout: null, signal: controller.signal });

    controller.abort();

    await expect(prom).rejects.toThrow(AbortError);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1]?.signal).toBeDefined();
    expect(callArgs[1]?.signal?.aborted).toBe(true);
  });
});
