export type JSONRPCRequestData = IJSONRPCData | IBatchRequest[];

export interface IJSONRPCData {
  internalID: string | number;
  request: IJSONRPCRequest | IJSONRPCNotification;
}

export interface IBatchRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (data: any) => void;
  request: IJSONRPCData; // IJSONRPCNotification | IJSONRPCRequest;
}

export interface IJSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[] | object;
}

export interface IJSONRPCError {
  code: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface IJSONRPCResponse {
  jsonrpc: "2.0";
  id?: string | number; // can also be null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  error?: IJSONRPCError;
}

export interface IJSONRPCNotificationResponse {
  jsonrpc: "2.0";
  id?: null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  error?: IJSONRPCError;
}

export interface IJSONRPCNotification {
  jsonrpc: "2.0";
  id?: null | undefined;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[] | object;
}

interface IRPCRequest {
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any[];
  type: "single";
}

interface IBatchRPCRequest {
  type: "batch";
  batch: IJSONRPCRequest[];
}

export type Request = IRPCRequest | IBatchRPCRequest;

export const isNotification = (data: IJSONRPCData): boolean => {
  return data.request.id === undefined || data.request.id === null;
};

export const getBatchRequests = (data: JSONRPCRequestData): IJSONRPCData[] => {
  if (data instanceof Array) {
    return data
      .filter((datum) => {
        const id = datum.request.request.id;
        return id !== null && id !== undefined;
      })
      .map((batchRequest: IBatchRequest) => {
        return batchRequest.request;
      });
  }
  return [];
};
export const getNotifications = (data: JSONRPCRequestData): IJSONRPCData[] => {
  if (data instanceof Array) {
    return data
      .filter((datum) => {
        return isNotification(datum.request);
      })
      .map((batchRequest: IBatchRequest) => {
        return batchRequest.request;
      });
  }
  if (isNotification(data)) {
    return [data];
  }
  return [];
};
