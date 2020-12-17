export const ERR_TIMEOUT = 7777;
export const ERR_MISSIING_ID = 7878;
export const ERR_UNKNOWN = 7979;

export class JSONRPCError extends Error {
  public message: string;
  public code: number;
  public data?: unknown;
  constructor(message: string, code: number, data?: any) {
    super(message);
    this.message = message;
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain: see https://github.com/open-rpc/client-js/issues/209
  }
}

export const convertJSONToRPCError = (payload: any): JSONRPCError => {
  if (payload.error) {
    const { message, code, data } = payload.error;
    return new JSONRPCError(message, code, data);
  }
  return new JSONRPCError("Unknown error", ERR_UNKNOWN, payload);
};
