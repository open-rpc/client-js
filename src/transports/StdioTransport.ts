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

function waitForSpawn(child: ChildProcess): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child.once("spawn", () => resolve());
    child.once("error", (err) => reject(err));
  });
}

async function shutdown(child: ChildProcess, timeout: number): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.stdin?.end();
  const killTimer = setTimeout(() => child.kill("SIGKILL"), timeout);
  try {
    await new Promise<void>((resolve) => child.once("exit", () => resolve()));
  } finally {
    clearTimeout(killTimer);
  }
}

/**
 * Bridges a child's Node stdio to a Web Streams pair. As a client we write to
 * the child's stdin and read from its stdout.
 */
export function childStreamPair(
  child: ChildProcess,
  shutdownTimeout: number,
): StreamPair {
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
    dispose: () => shutdown(child, shutdownTimeout),
  };
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
        await waitForSpawn(child);
        return childStreamPair(child, options.shutdownTimeout ?? 2000);
      },
    });
  }
}

export default StdioTransport;
export { StdioTransport };
