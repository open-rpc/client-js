import { convertJSONToRPCError, JSONRPCError } from "./Error.js";
import { generateMockErrorResponse } from "./__mocks__/requestData.js";

describe("Error test", () => {
  it("should convert payload to JSONRPC error ", () => {
    let err = convertJSONToRPCError("message");
    expect(err instanceof Error).toBe(true);
    err = convertJSONToRPCError(generateMockErrorResponse(1, "somedata"));
    expect(err instanceof Error).toBe(true);
  });

  it("should construct JSONRPCError", () => {
    new JSONRPCError("test", 9999);
    new JSONRPCError("test", 9999, "testdata");
  });

  it("should be able to use instanceof", () => {
    const err = new JSONRPCError("test", 9999);
    expect(err instanceof JSONRPCError).toBe(true);
  });
});
