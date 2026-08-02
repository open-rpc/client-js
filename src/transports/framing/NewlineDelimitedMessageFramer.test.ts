import { NewlineDelimitedMessageFramer } from "./NewlineDelimitedMessageFramer.js";

const enc = new TextEncoder();
const dec = new TextDecoder();
const bytes = (s: string) => enc.encode(s);

describe("NewlineDelimitedMessageFramer", () => {
  it("encodes with a trailing newline", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(dec.decode(f.encode('{"a":1}'))).toBe('{"a":1}\n');
  });

  it("decodes one message per chunk", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('{"a":1}\n'))).toEqual(['{"a":1}']);
  });

  it("reassembles a message split across two chunks", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('{"a":'))).toEqual([]);
    expect(f.decode(bytes("1}\n"))).toEqual(['{"a":1}']);
  });

  it("splits two messages in one chunk", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('{"a":1}\n{"b":2}\n'))).toEqual([
      '{"a":1}',
      '{"b":2}',
    ]);
  });

  it("retains a trailing partial across decode calls", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('{"a":1}\n{"b":'))).toEqual(['{"a":1}']);
    expect(f.decode(bytes("2}\n"))).toEqual(['{"b":2}']);
  });

  it("handles a multi-byte UTF-8 character split across a chunk boundary", () => {
    const f = new NewlineDelimitedMessageFramer();
    const full = bytes('{"s":"\u20ac"}\n'); // euro sign is 3 bytes: E2 82 AC
    const splitAt = full.indexOf(0xe2) + 1; // only the first byte of the euro
    expect(f.decode(full.subarray(0, splitAt))).toEqual([]);
    expect(f.decode(full.subarray(splitAt))).toEqual(['{"s":"\u20ac"}']);
  });

  it("tolerates CRLF line endings", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('{"a":1}\r\n'))).toEqual(['{"a":1}']);
  });

  it("drops empty lines", () => {
    const f = new NewlineDelimitedMessageFramer();
    expect(f.decode(bytes('\n{"a":1}\n\n'))).toEqual(['{"a":1}']);
  });

  it("reset clears buffered partial input", () => {
    const f = new NewlineDelimitedMessageFramer();
    f.decode(bytes('{"a":'));
    f.reset();
    expect(f.decode(bytes('{"b":2}\n'))).toEqual(['{"b":2}']);
  });
});
