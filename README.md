# client-js
A browser-compatible JSON-RPC client with multiple transports.

```javascript
import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
const transport = new HTTPTransport('http://localhost:8545');
const client = new Client(new RequestManager([transport]));
const result = await client.request(‘addition’, [2, 2]);
// => { jsonrpc: '2.0', id: 1, result: 4 }
```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
