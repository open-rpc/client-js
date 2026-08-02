import { concatBytes, indexOfSubarray } from "./MessageFramer.js";

const enc = new TextEncoder();
const bytes = (s: string) => enc.encode(s);

describe("MessageFramer byte helpers", () => {
  it("indexOfSubarray returns the start when the needle is empty", () => {
    expect(indexOfSubarray(bytes("abc"), new Uint8Array(0), 2)).toBe(2);
  });

  it("indexOfSubarray finds a needle", () => {
    expect(indexOfSubarray(bytes("abcd"), bytes("cd"))).toBe(2);
  });

  it("indexOfSubarray returns -1 when the needle is absent", () => {
    expect(indexOfSubarray(bytes("abcd"), bytes("ce"))).toBe(-1);
  });

  it("concatBytes joins two byte arrays", () => {
    expect(Array.from(concatBytes(bytes("ab"), bytes("cd")))).toEqual(
      Array.from(bytes("abcd")),
    );
  });
});
