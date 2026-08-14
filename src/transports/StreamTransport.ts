import { Transport } from "./Transport.js";
import {
  JSONRPCRequestData,
  getNotifications,
  getBatchRequests,
} from "../Request.js";
import { JSONRPCError, ERR_UNKNOWN } from "../Error.js";
import { MessageFramer } from "./framing/MessageFramer.js";
import { NewlineDelimitedMessageFramer } from "./framing/NewlineDelimitedMessageFramer.js";

export interface StreamPair {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  logStream?: ReadableStream<Uint8Array>;
  dispose?: () => Promise<void> | void;
}

export interface StreamTransportOptions {
  provider: () => StreamPair | Promise<StreamPair>;
  framer?: MessageFramer;
  onLog?: (chunk: string) => void;
}

class StreamTransport extends Transport {
  private readonly provider: StreamTransportOptions["provider"];
  private readonly framer: MessageFramer;
  private readonly onLog?: (chunk: string) => void;
  private streams?: StreamPair;
  private writer?: WritableStreamDefaultWriter<Uint8Array>;
  private reader?: ReadableStreamDefaultReader<Uint8Array>;
  private logReader?: ReadableStreamDefaultReader<Uint8Array>;
  private closed = false;
  private connecting?: Promise<void>;
  private closing?: Promise<void>;

  constructor(options: StreamTransportOptions) {
    super();
    this.provider = options.provider;
    this.framer = options.framer ?? new NewlineDelimitedMessageFramer();
    this.onLog = options.onLog;
  }

  public async connect(): Promise<void> {
    // here we check for concurrent connect/close races
    if (!this.closed && this.streams) return;
    if (!this.connecting) {
      const attempt: Promise<void> = this.reopen().finally(() => {
        if (this.connecting === attempt) this.connecting = undefined;
      });
      this.connecting = attempt;
    }
    return this.connecting;
  }

  private async reopen(): Promise<void> {
    if (this.closing) {
      await this.closing;
      this.closing = undefined;
    }
    this.closed = false;
    await this.open();
  }

  private async open(): Promise<void> {
    const streams = await this.provider();
    this.streams = streams;
    this.writer = streams.writable.getWriter();
    this.reader = streams.readable.getReader();

    void this.pump(this.reader);
    if (streams.logStream && this.onLog) {
      this.logReader = streams.logStream.getReader();
      void this.pumpLog(this.logReader);
    }
  }

  public async sendData(
    data: JSONRPCRequestData,
    timeout: number | null = null,
  ): Promise<unknown> {
    const prom = this.transportRequestManager.addRequest(data, timeout);
    const notifications = getNotifications(data);
    try {
      await this.write(
        this.framer.encode(JSON.stringify(this.parseData(data))),
      );
      this.transportRequestManager.settlePendingRequest(notifications);
    } catch (e) {
      const error = e as Error;
      const responseErr = new JSONRPCError(error.message, ERR_UNKNOWN, error);
      this.transportRequestManager.settlePendingRequest(
        notifications,
        responseErr,
      );
      this.transportRequestManager.settlePendingRequest(
        getBatchRequests(data),
        responseErr,
      );
      return Promise.reject(responseErr);
    }
    return prom;
  }

  public sendRaw(payload: string): Promise<void> {
    return this.write(this.framer.encode(payload));
  }

  public close(): void {
    if (this.closed) return;
    this.closed = true;
    const pending = this.connecting;
    this.connecting = undefined;
    if (!pending) {
      this.teardown();
      this.closing = Promise.resolve();
      return;
    }
    // the provider is mid-flight and already owns a resource (a spawned child,
    // an open socket); tear down once it lands or that resource leaks
    const teardown = () => this.teardown();
    this.closing = pending.then(teardown, teardown);
  }

  private teardown(): void {
    const streams = this.streams;
    this.streams = undefined;
    void this.reader?.cancel().catch(() => undefined);
    this.reader = undefined;
    void this.logReader?.cancel().catch(() => undefined);
    this.logReader = undefined;
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch {
        // ignore: a pending write can make releaseLock throw
      }
      this.writer = undefined;
    }
    void Promise.resolve(streams?.dispose?.()).catch(() => undefined);
  }

  private write(frame: Uint8Array): Promise<void> {
    if (this.closed || !this.writer) {
      return Promise.reject(new Error("Transport is not connected"));
    }
    return this.writer.write(frame);
  }

  private async pump(
    reader: ReadableStreamDefaultReader<Uint8Array>,
  ): Promise<void> {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        for (const message of this.framer.decode(value)) {
          this.transportRequestManager.resolveResponse(message);
        }
      }
    } catch (e) {
      if (this.closed) return;
      const error = e as Error;
      this.transportRequestManager.transportEventChannel.emit(
        "error",
        new JSONRPCError(error.message, ERR_UNKNOWN, error),
      );
    }
  }

  private async pumpLog(
    reader: ReadableStreamDefaultReader<Uint8Array>,
  ): Promise<void> {
    const decoder = new TextDecoder("utf-8");
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value && this.onLog) {
          this.onLog(decoder.decode(value, { stream: true }));
        }
      }
    } catch {
      // log stream errors are non-fatal
    }
  }

  public static fromStreams(
    readable: ReadableStream<Uint8Array>,
    writable: WritableStream<Uint8Array>,
    framer?: MessageFramer,
  ): StreamTransport {
    return new StreamTransport({
      provider: () => ({ readable, writable }),
      framer,
    });
  }
}

export default StreamTransport;
export { StreamTransport };
