# OpenRPC Client JS

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/client-js/master.svg">
    <img src="https://codecov.io/gh/open-rpc/client-js/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/client-js" />
    <img alt="Chat on Discord" src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/client-js.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/client-js.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/client-js/latest.svg" />
  </span>
</center>

A browser-compatible JSON-RPC client with multiple transports:

- EventEmitter
- HTTP/HTTPS
- WebSocket
- PostMessageWindow
- PostMessageIframe


```javascript
import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";
const transport = new HTTPTransport("http://localhost:8545");
const client = new Client(new RequestManager([transport]));
const result = await client.request({method: "addition", params: [2, 2]});
// => { jsonrpc: '2.0', id: 1, result: 4 }
```

#### Examples

<details>
  <summary>EventEmitter</summary>

```javascript
import { EventEmitter } from "events";
import { RequestManager, EventEmitterTransport, Client } from "@open-rpc/client-js";

const chan1 = "chan1";
const chan2 = "chan2";

const emitter = new EventEmitter();
const transport = new EventEmitterTransport(emitter, chan1, chan2);
const requestManager = new RequestManager([transport]);
const client = new Client(requestManager);

// event emitter server code
emitter.on(chan1, (jsonrpcRequest) => {
  const res = {
    jsonrpc: "2.0",
    result: "potato",
    id: jsonrpcRequest.id,
  };
  emitter.emit(chan2, JSON.stringify(res));
});

const main = async () => {
  const result = await client.request({method: "addition", params: [2, 2]});
  console.log(result);
};

main().then(() => {
  console.log("DONE");
});
```

</details>


<details>
  <summary>HTTP</summary>

```javascript
import { RequestManager, Client, HTTPTransport } from "@open-rpc/client-js";

const transport = new HTTPTransport("http://localhost:3333");
const requestManager = new RequestManager([transport]);
const client = new Client(requestManager);

const main = async () => {
  const result = await client.request({method: "addition", params: [2, 2]});
  console.log(result);
};

main().then(() => {
  console.log("DONE");
});
```

</details>


<details>
  <summary>WebSocket</summary>

```javascript
import { RequestManager, Client, WebSocketTransport } from "@open-rpc/client-js";

const transport = new WebSocketTransport("ws://localhost:3333");
const requestManager = new RequestManager([transport]);
const client = new Client(requestManager);

const main = async () => {
  const result = await client.request({method: "addition", params: [2, 2]});
  console.log(result);
};

main().then(() => {
  console.log("DONE");
  client.close();
});

```

</details>


### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
