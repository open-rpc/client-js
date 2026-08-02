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
});
