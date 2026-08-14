import {
  MessageFramer,
  concatBytes,
  indexOfSubarray,
} from "./MessageFramer.js";

// "\r\n\r\n"
const HEADER_TERMINATOR = new Uint8Array([13, 10, 13, 10]);

/**
 * `Content-Length` framing as used by LSP:
 * `Content-Length: <bytes>\r\n\r\n<body>`.
 **/
export class ContentLengthMessageFramer implements MessageFramer {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder("utf-8");
  private buffer: Uint8Array = new Uint8Array(0);

  public encode(message: string): Uint8Array {
    const body = this.encoder.encode(message);
    const header = this.encoder.encode(
      `Content-Length: ${body.length}\r\n\r\n`,
    );
    return concatBytes(header, body);
  }

  public decode(chunk: Uint8Array): string[] {
    this.buffer = concatBytes(this.buffer, chunk);
    const messages: string[] = [];
    for (;;) {
      const headerEnd = indexOfSubarray(this.buffer, HEADER_TERMINATOR);
      if (headerEnd === -1) break;
      const bodyStart = headerEnd + HEADER_TERMINATOR.length;
      const header = this.decoder.decode(this.buffer.subarray(0, headerEnd));
      const match = /content-length:\s*(\d+)/i.exec(header);
      if (!match) {
        // Malformed frame: drop the header and resync on the next terminator.
        this.buffer = this.buffer.subarray(bodyStart);
        continue;
      }
      const length = parseInt(match[1], 10);
      if (this.buffer.length < bodyStart + length) break; // body not fully arrived
      const body = this.buffer.subarray(bodyStart, bodyStart + length);
      messages.push(this.decoder.decode(body));
      this.buffer = this.buffer.subarray(bodyStart + length);
    }
    return messages;
  }

  public reset(): void {
    this.buffer = new Uint8Array(0);
  }
}
