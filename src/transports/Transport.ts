
export default interface ITransport {
  connect(): Promise<any>;
  close(): void;
  onData(callback: (data: string) => any): void;
  sendData(data: string): void;
}
