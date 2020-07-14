import { Client, RequestManager, HTTPTransport } from ".";
const t = new HTTPTransport("http://localhost:3333");
const c = new Client(new RequestManager([t]));

c.request({method: "addition", params: [2, 2]}).then((result: any) => {
  console.log('addition result: ', result); // tslint:disable-line
});
