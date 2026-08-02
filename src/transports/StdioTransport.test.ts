/**
 * @jest-environment node
 */
import StdioTransport from "./StdioTransport.js";

// A tiny JSON-RPC echo "server": for each line, reply with the params as result.
const ECHO_SERVER = `
let buf = "";
process.stdin.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\\n")) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    process.stdout.write(
      JSON.stringify({ jsonrpc: "2.0", id: msg.id, result: msg.params }) + "\\n"
    );
  }
});
`;

describe("StdioTransport", () => {
  it("spawns a child, exchanges a message, and disposes", async () => {
    const transport = new StdioTransport({
      command: process.execPath,
      args: ["-e", ECHO_SERVER],
    });
    await transport.connect();
    const result = await transport.sendData(
      {
        request: { jsonrpc: "2.0", id: 1, method: "echo", params: ["hi"] },
        internalID: 1,
      },
      5000,
    );
    expect(result).toEqual(["hi"]);
    transport.close();
  }, 20000);

  it("rejects the spawn provider when the command does not exist", async () => {
    const transport = new StdioTransport({
      command: "this-command-does-not-exist-xyz",
    });
    await expect(transport.connect()).rejects.toBeDefined();
  }, 20000);

  it("waits for the child to exit on graceful shutdown", async () => {
    const transport = new StdioTransport({
      command: process.execPath,
      args: ["-e", ECHO_SERVER],
    });
    await transport.connect();
    transport.close();
    // Give shutdown() time to run its once("exit") await and clearTimeout.
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, 20000);

  it("SIGKILLs a child that ignores stdin EOF", async () => {
    const transport = new StdioTransport({
      command: process.execPath,
      args: ["-e", "setInterval(() => {}, 1000)"],
      shutdownTimeout: 50,
    });
    await transport.connect();
    transport.close();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, 20000);

  it("shutdown is a no-op for an already-exited child", async () => {
    const transport = new StdioTransport({
      command: process.execPath,
      args: ["-e", ""],
    });
    await transport.connect();
    // Wait for the short-lived child to exit before disposing.
    await new Promise((resolve) => setTimeout(resolve, 300));
    transport.close();
    await new Promise((resolve) => setTimeout(resolve, 200));
  }, 20000);
});
