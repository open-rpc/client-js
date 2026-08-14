export interface MessageFramer {
  encode(message: string): Uint8Array;
  decode(chunk: Uint8Array): string[];
  reset(): void;
}

export const concatBytes = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
};

export const indexOfSubarray = (
  haystack: Uint8Array,
  needle: Uint8Array,
  start = 0,
): number => {
  if (needle.length === 0) return start;
  const last = haystack.length - needle.length;
  for (let i = start; i <= last; i++) {
    let matched = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
};
