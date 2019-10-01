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

- HTTP/HTTPS
- WebSocket
- Event Emitter

```javascript
import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";
const transport = new HTTPTransport("http://localhost:8545");
const client = new Client(new RequestManager([transport]));
const result = await client.request("addition", [2, 2]);
// => { jsonrpc: '2.0', id: 1, result: 4 }
```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
