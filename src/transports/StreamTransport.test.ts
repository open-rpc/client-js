import StreamTransport from "./StreamTransport.js";
import {
  generateMockRequest,
  generateMockNotificationRequest,
} from "../__mocks__/requestData.js";

const enc = new TextEncoder();
const dec = new TextDecoder();

interface Pair {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  push: (s: string) => void;
  written: string[];
}

const makePair = (): Pair => {
  let push: (s: string) => void = () => undefined;
  const written: string[] = [];
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      push = (s: string) => controller.enqueue(enc.encode(s));
    },
  });
  const writable = new WritableStream<Uint8Array>({
    write(chunk) {
      written.push(dec.decode(chunk));
    },
  });
  return { readable, writable, push, written };
};

describe("StreamTransport", () => {
  it("resolves a request when a matching response arrives", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    const p = t.sendData({
      request: generateMockRequest(1, "foo", ["bar"]),
      internalID: 1,
    });
    pair.push(JSON.stringify({ jsonrpc: "2.0", id: 1, result: 42 }) + "\n");
    await expect(p).resolves.toEqual(42);
    t.close();
  });

  it("settles a notification without waiting for a response", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    const result = await t.sendData({
      request: generateMockNotificationRequest("foo", ["bar"]),
      internalID: 2,
    });
    expect(result).toBeUndefined();
    expect(pair.written.length).toBe(1);
    t.close();
  });

  it("emits a notification for an inbound server notification", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    const received = new Promise((resolve) =>
      t.subscribe("notification", resolve),
    );
    pair.push(
      JSON.stringify({ jsonrpc: "2.0", method: "tick", params: [1] }) + "\n",
    );
    await expect(received).resolves.toMatchObject({ method: "tick" });
    t.close();
  });

  it("rejects with a JSONRPCError when the write fails", async () => {
    const readable = new ReadableStream<Uint8Array>({ start() {} });
    const writable = new WritableStream<Uint8Array>({
      write() {
        throw new Error("pipe broken");
      },
    });
    const t = StreamTransport.fromStreams(readable, writable);
    await t.connect();
    await expect(
      t.sendData({
        request: generateMockRequest(3, "foo", ["bar"]),
        internalID: 3,
      }),
    ).rejects.toThrow("pipe broken");
    t.close();
  });

  it("close is idempotent", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    t.close();
    expect(() => t.close()).not.toThrow();
  });

  it("uses the provided framer", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    await t.sendData({
      request: generateMockNotificationRequest("foo", ["bar"]),
      internalID: 4,
    });
    expect(pair.written[0].endsWith("\n")).toBe(true);
    t.close();
  });

  it("connect is idempotent", async () => {
    const pair = makePair();
    const provider = jest.fn(() => ({
      readable: pair.readable,
      writable: pair.writable,
    }));
    const t = new StreamTransport({ provider });

    await t.connect();
    await t.connect();

    expect(provider).toHaveBeenCalledTimes(1);

    // a second reader/writer on the same streams would have thrown above, but
    // assert the transport is still usable rather than merely un-thrown
    const p = t.sendData({
      request: generateMockRequest(6, "foo", ["bar"]),
      internalID: 6,
    });
    pair.push(JSON.stringify({ jsonrpc: "2.0", id: 6, result: 9 }) + "\n");
    await expect(p).resolves.toEqual(9);
    expect(pair.written.length).toBe(1);
    t.close();
  });

  it("connect is idempotent under concurrent calls", async () => {
    const pair = makePair();
    const provider = jest.fn(
      () =>
        new Promise<{
          readable: ReadableStream<Uint8Array>;
          writable: WritableStream<Uint8Array>;
        }>((resolve) =>
          setTimeout(
            () => resolve({ readable: pair.readable, writable: pair.writable }),
            5,
          ),
        ),
    );
    const t = new StreamTransport({ provider });

    await Promise.all([t.connect(), t.connect()]);

    expect(provider).toHaveBeenCalledTimes(1);

    const p = t.sendData({
      request: generateMockRequest(7, "foo", ["bar"]),
      internalID: 7,
    });
    pair.push(JSON.stringify({ jsonrpc: "2.0", id: 7, result: 11 }) + "\n");
    await expect(p).resolves.toEqual(11);
    expect(pair.written.length).toBe(1);
    t.close();
  });

  it("sendRaw writes a framed payload", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await t.connect();
    await t.sendRaw('{"a":1}');
    expect(pair.written[0]).toBe('{"a":1}\n');
    t.close();
  });

  it("sendRaw rejects before connect", async () => {
    const pair = makePair();
    const t = StreamTransport.fromStreams(pair.readable, pair.writable);
    await expect(t.sendRaw("x")).rejects.toThrow("Transport is not connected");
  });

  it("skips an undefined chunk in the read loop", async () => {
    let push: (v: Uint8Array | undefined) => void = () => undefined;
    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        push = (v) => controller.enqueue(v as Uint8Array);
      },
    });
    const writable = new WritableStream<Uint8Array>({ write() {} });
    const t = StreamTransport.fromStreams(readable, writable);
    await t.connect();
    const p = t.sendData({
      request: generateMockRequest(5, "foo", ["bar"]),
      internalID: 5,
    });
    push(undefined);
    push(
      enc.encode(JSON.stringify({ jsonrpc: "2.0", id: 5, result: 7 }) + "\n"),
    );
    await expect(p).resolves.toEqual(7);
    t.close();
  });

  it("emits an error when the framer throws", async () => {
    const pair = makePair();
    const framer = {
      encode: (m: string) => enc.encode(m + "\n"),
      decode: (): string[] => {
        throw new Error("bad frame");
      },
      reset: () => undefined,
    };
    const t = StreamTransport.fromStreams(pair.readable, pair.writable, framer);
    await t.connect();
    const err = new Promise((resolve) => t.subscribe("error", resolve));
    pair.push("x\n");
    await expect(err).resolves.toMatchObject({ message: "bad frame" });
    t.close();
  });

  it("stays silent when the read loop fails after close", async () => {
    const pair = makePair();
    let self: StreamTransport;
    const framer = {
      encode: (m: string) => enc.encode(m + "\n"),
      decode: (): string[] => {
        self.close();
        throw new Error("bad frame");
      },
      reset: () => undefined,
    };
    const t = StreamTransport.fromStreams(pair.readable, pair.writable, framer);
    self = t;
    await t.connect();
    const onError = jest.fn();
    t.subscribe("error", onError);
    pair.push("x\n");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onError).not.toHaveBeenCalled();
  });

  it("pumps the log stream to onLog", async () => {
    const pair = makePair();
    const logStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(enc.encode("boot\n"));
        controller.close();
      },
    });
    const onLog = jest.fn();
    const t = new StreamTransport({
      provider: () => ({
        readable: pair.readable,
        writable: pair.writable,
        logStream,
      }),
      onLog,
    });
    await t.connect();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onLog).toHaveBeenCalledWith("boot\n");
    t.close();
  });

  it("close swallows cancel and dispose rejections", async () => {
    const readable = new ReadableStream<Uint8Array>({
      cancel() {
        throw new Error("cancel failed");
      },
    });
    const logStream = new ReadableStream<Uint8Array>({
      cancel() {
        throw new Error("log cancel failed");
      },
    });
    const writable = new WritableStream<Uint8Array>({ write() {} });
    const t = new StreamTransport({
      provider: () => ({
        readable,
        writable,
        logStream,
        dispose: () => Promise.reject(new Error("nope")),
      }),
      onLog: () => undefined,
    });
    await t.connect();
    expect(() => t.close()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
});
