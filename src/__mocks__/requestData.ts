import * as req from "../Request.js";
import url from "url";

export const generateMockNotificationRequest = (
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[],
): req.IJSONRPCNotification => {
  return {
    jsonrpc: "2.0",
    method,
    params,
  };
};

export const generateMockRequest = (
  id: number,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[],
): req.IJSONRPCRequest => {
  return {
    id,
    jsonrpc: "2.0",
    method,
    params,
  };
};

export const generateMockResponse = (
  id: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any,
): req.IJSONRPCResponse => {
  return {
    id,
    jsonrpc: "2.0",
    result,
    error,
  };
};

export const generateMockNotificationResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any,
): req.IJSONRPCNotificationResponse => {
  return {
    jsonrpc: "2.0",
    result,
    error,
  };
};

export const generateMockErrorResponse = (
  id: number | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): req.IJSONRPCResponse => {
  return {
    id,
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Error message",
      data,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateMockResponseData = (uri: string, data: any) => {
  const parsedUrl = url.parse(uri);
  const path = parsedUrl.path || "";
  const rpcNotification = path.search("rpc-notification");
  const rpcResponse = path.search("rpc-response");
  const rpcRequest = path.search("rpc-request");
  const rpcError = path.search("rpc-error");
  const rpcGarbage = path.search("rpc-garbage");
  if (rpcResponse > 0 || rpcRequest > 0) {
    return generateRequestResponse(false, data);
  }
  if (rpcError > 0) {
    return generateRequestResponse(true, data);
  }
  if (rpcNotification > 0) {
    return;
  }
  if (rpcGarbage > 0) {
    return "Garbage Response";
  }
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateSingleRequestResponse = (error: boolean, data: any) => {
  if (error) {
    return generateMockErrorResponse(data.id, data);
  }
  return generateMockResponse(data.id, data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateRequestResponse = (error: boolean, data: any): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsedReq: any = data;

  if (typeof data === "string") {
    parsedReq = JSON.parse(data);
  }
  if (parsedReq instanceof Array) {
    return JSON.stringify(
      parsedReq.map((parsed) => generateSingleRequestResponse(error, parsed)),
    );
  }
  return JSON.stringify(generateSingleRequestResponse(error, parsedReq));
};
