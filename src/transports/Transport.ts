export default interface ITransport {
  connect(): Promise<any>;
  close(): void;
  onError(callback: (error: Error) => void): void;
  onData(callback: (data: string) => any): void;
  sendData(data: string): void;
}
