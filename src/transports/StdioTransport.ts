import { spawn, ChildProcess } from "child_process";
import { Readable, Writable } from "stream";
import { StreamTransport, StreamPair } from "./StreamTransport.js";
import { MessageFramer } from "./framing/MessageFramer.js";

export interface StdioTransportOptions {
  command: string;
  args?: string[];
  framer?: MessageFramer;
  onLog?: (chunk: string) => void;
  /** ms to wait for graceful exit before SIGKILL */
  shutdownTimeout?: number;
}

class StdioTransport extends StreamTransport {
  constructor(options: StdioTransportOptions) {
    super({
      framer: options.framer,
      onLog: options.onLog,
      provider: async (): Promise<StreamPair> => {
        const child = spawn(options.command, options.args ?? [], {
          stdio: ["pipe", "pipe", "pipe"],
        });
        await StdioTransport.waitForSpawn(child);
        // As a client we write to the child's stdin and read from its stdout.
        return {
          readable: Readable.toWeb(
            child.stdout as Readable,
          ) as unknown as ReadableStream<Uint8Array>,
          writable: Writable.toWeb(
            child.stdin as Writable,
          ) as unknown as WritableStream<Uint8Array>,
          logStream: child.stderr
            ? (Readable.toWeb(
                child.stderr as Readable,
              ) as unknown as ReadableStream<Uint8Array>)
            : undefined,
          dispose: () =>
            StdioTransport.shutdown(child, options.shutdownTimeout ?? 2000),
        };
      },
    });
  }

  private static waitForSpawn(child: ChildProcess): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      child.once("spawn", () => resolve());
      child.once("error", (err) => reject(err));
    });
  }

  private static async shutdown(
    child: ChildProcess,
    timeout: number,
  ): Promise<void> {
    if (child.exitCode !== null || child.signalCode !== null) return;
    // Closing stdin signals EOF so a well-behaved child exits on its own.
    child.stdin?.end();
    const killTimer = setTimeout(() => child.kill("SIGKILL"), timeout);
    try {
      await new Promise<void>((resolve) => child.once("exit", () => resolve()));
    } finally {
      clearTimeout(killTimer);
    }
  }
}

export default StdioTransport;
export { StdioTransport };
