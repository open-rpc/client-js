import { ContentLengthMessageFramer } from "./ContentLengthMessageFramer.js";
import { concatBytes } from "./MessageFramer.js";

const enc = new TextEncoder();
const dec = new TextDecoder();
const bytes = (s: string) => enc.encode(s);

const frameAll = (...msgs: string[]): Uint8Array => {
  const g = new ContentLengthMessageFramer();
  return msgs
    .map((m) => g.encode(m))
    .reduce((acc, part) => concatBytes(acc, part), new Uint8Array(0));
};

describe("ContentLengthMessageFramer", () => {
  it("encodes with a byte-count header", () => {
    const f = new ContentLengthMessageFramer();
    expect(dec.decode(f.encode('{"a":1}'))).toBe(
      'Content-Length: 7\r\n\r\n{"a":1}',
    );
  });

  it("uses byte length, not string length, for multi-byte bodies", () => {
    const f = new ContentLengthMessageFramer();
    const msg = '{"s":"\u20ac"}'; // string length 9, byte length 11
    expect(
      dec.decode(f.encode(msg)).startsWith("Content-Length: 11\r\n\r\n"),
    ).toBe(true);
  });

  it("decodes a single framed message", () => {
    const f = new ContentLengthMessageFramer();
    expect(f.decode(bytes('Content-Length: 7\r\n\r\n{"a":1}'))).toEqual([
      '{"a":1}',
    ]);
  });

  it("decodes a body whose byte length differs from its string length", () => {
    const f = new ContentLengthMessageFramer();
    const msg = '{"s":"\u20ac"}';
    expect(f.decode(f.encode(msg))).toEqual([msg]);
  });

  it("reassembles a frame across chunks", () => {
    const f = new ContentLengthMessageFramer();
    expect(f.decode(bytes("Content-Length: 7\r\n\r"))).toEqual([]);
    expect(f.decode(bytes('\n{"a":'))).toEqual([]);
    expect(f.decode(bytes("1}"))).toEqual(['{"a":1}']);
  });

  it("decodes two messages in one chunk", () => {
    const f = new ContentLengthMessageFramer();
    expect(f.decode(frameAll('{"a":1}', '{"b":2}'))).toEqual([
      '{"a":1}',
      '{"b":2}',
    ]);
  });

  it("is case-insensitive on the header name", () => {
    const f = new ContentLengthMessageFramer();
    expect(f.decode(bytes('content-length: 7\r\n\r\n{"a":1}'))).toEqual([
      '{"a":1}',
    ]);
  });

  it("reset clears buffered partial input", () => {
    const f = new ContentLengthMessageFramer();
    f.decode(bytes("Content-Length: 7\r\n\r\n{"));
    f.reset();
    expect(f.decode(bytes('Content-Length: 7\r\n\r\n{"b":2}'))).toEqual([
      '{"b":2}',
    ]);
  });

  it("drops a malformed header and resyncs on the next frame", () => {
    const f = new ContentLengthMessageFramer();
    expect(
      f.decode(bytes('X-Other: 1\r\n\r\nContent-Length: 7\r\n\r\n{"a":1}')),
    ).toEqual(['{"a":1}']);
  });
});
