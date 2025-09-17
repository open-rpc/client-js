import { Client, RequestManager, HTTPTransport } from "./index.js";
const t = new HTTPTransport("http://localhost:3333");
const c = new Client(new RequestManager([t]));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
c.request({ method: "addition", params: [2, 2] }).then((result: any) => {
  // eslint-disable-next-line no-console
  console.log("addition result: ", result); // tslint:disable-line
});
