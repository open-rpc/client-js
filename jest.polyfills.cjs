// jsdom does not reliably expose Web Streams / encoding globals. These are
// native in Node 18+, Bun, and browsers; assign them for the jsdom test env.
// Guarded so this is a no-op wherever the globals already exist.
const { TextEncoder, TextDecoder } = require("util");
const { ReadableStream, WritableStream, TransformStream } = require("stream/web");

const g = globalThis;
if (typeof g.TextEncoder === "undefined") g.TextEncoder = TextEncoder;
if (typeof g.TextDecoder === "undefined") g.TextDecoder = TextDecoder;
if (typeof g.ReadableStream === "undefined") g.ReadableStream = ReadableStream;
if (typeof g.WritableStream === "undefined") g.WritableStream = WritableStream;
if (typeof g.TransformStream === "undefined") g.TransformStream = TransformStream;
