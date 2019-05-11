# client-js
A browser-compatible JSON-RPC client with multiple transports.

```
import { RequestManager, HTTPEndpoint, Client } from '@open-rpc/client-js';

const managers = [
  new RequestManager(new HTTPEndpoint(‘http://localhost:8545'))
]

const client = new Client(managers);
const result = await client.request(‘addition’, [2, 2]);
// => 4

```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
