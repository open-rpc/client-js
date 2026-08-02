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
});
