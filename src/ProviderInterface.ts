export interface ProviderRequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface Provider {
  request(args: ProviderRequestArguments): Promise<any>;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
