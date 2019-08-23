export default interface ITransport {
  connect(): Promise<any>;
  close(): void;
  onError(callback: (error: Error) => void): void;
  onData(callback: (data: string, onError: (error: Error) => void) => any): void;
  sendData(data: string): void;
}
