import { MessageFramer } from "./MessageFramer.js";

/**
 * Newline-delimited JSON framing: one JSON message per line, delimited by `\n`,
 * no embedded newlines. This is the framing used by MCP stdio and ACP.
 * `JSON.stringify` escapes any newlines inside string values, so the
 * "no embedded newlines" rule holds for free.
 */
export class NewlineDelimitedMessageFramer implements MessageFramer {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder("utf-8");
  private buffer = "";

  public encode(message: string): Uint8Array {
    return this.encoder.encode(`${message}\n`);
  }

  public decode(chunk: Uint8Array): string[] {
    // `stream: true` retains a trailing partial UTF-8 codepoint across chunks.
    this.buffer += this.decoder.decode(chunk, { stream: true });
    const parts = this.buffer.split("\n");
    this.buffer = parts.pop() ?? "";
    return parts.map((part) => part.trim()).filter((part) => part.length > 0);
  }

  public reset(): void {
    this.buffer = "";
    // Flush any retained partial codepoint from the decoder.
    this.decoder.decode();
  }
}
