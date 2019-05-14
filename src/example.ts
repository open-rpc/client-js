import Client from ".";
import RequestManager from "./RequestManager";
import Transport from "./transports/HTTPTransport";

const t = new Transport("http://localhost:8545");

const c = new Client(new RequestManager([t]));

// make request for eth_blockNumber
c.request("eth_blockNumber", []).then((b: any) => {
  console.log('in then', b); //tslint:disable-line
});
