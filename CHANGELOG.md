## [1.2.5](https://github.com/open-rpc/client-js/compare/1.2.4...1.2.5) (2020-03-27)


### Bug Fixes

* update npm vulns ([eaa935b](https://github.com/open-rpc/client-js/commit/eaa935bcb8bbf470bddae26b7e3ce7bd6d638015))

## [1.2.4](https://github.com/open-rpc/client-js/compare/1.2.3...1.2.4) (2019-10-07)


### Bug Fixes

* corrects handling for response payloads ([e762764](https://github.com/open-rpc/client-js/commit/e762764)), closes [#75](https://github.com/open-rpc/client-js/issues/75)

## [1.2.3](https://github.com/open-rpc/client-js/compare/1.2.2...1.2.3) (2019-09-30)


### Bug Fixes

* readme single quote to double quote ([aa0e8b2](https://github.com/open-rpc/client-js/commit/aa0e8b2))
* websocket transport to serialize string prior to sending ([adee025](https://github.com/open-rpc/client-js/commit/adee025))

## [1.2.2](https://github.com/open-rpc/client-js/compare/1.2.1...1.2.2) (2019-09-23)


### Bug Fixes

* expose JSONRPCError type ([6258256](https://github.com/open-rpc/client-js/commit/6258256))

## [1.2.1](https://github.com/open-rpc/client-js/compare/1.2.0...1.2.1) (2019-09-20)


### Bug Fixes

* error handling on error response without id ([cdecef1](https://github.com/open-rpc/client-js/commit/cdecef1))

# [1.2.0](https://github.com/open-rpc/client-js/compare/1.1.1...1.2.0) (2019-09-17)


### Features

* refactor clientjs to support err handling ([c3686c9](https://github.com/open-rpc/client-js/commit/c3686c9))

## [1.1.1](https://github.com/open-rpc/client-js/compare/1.1.0...1.1.1) (2019-08-22)


### Bug Fixes

* **transports:** handle multiple onData callback ([b125962](https://github.com/open-rpc/client-js/commit/b125962)), closes [#53](https://github.com/open-rpc/client-js/issues/53)

# [1.1.0](https://github.com/open-rpc/client-js/compare/1.0.1...1.1.0) (2019-07-30)


### Bug Fixes

* **batching:** add error tests ([46e8eec](https://github.com/open-rpc/client-js/commit/46e8eec))
* **batching:** add tests ([c867faa](https://github.com/open-rpc/client-js/commit/c867faa))
* change name of endBatch to stopBatch ([60c48ca](https://github.com/open-rpc/client-js/commit/60c48ca))
* **README:** add transport support ([1c57adc](https://github.com/open-rpc/client-js/commit/1c57adc))
* add more docs ([7423e52](https://github.com/open-rpc/client-js/commit/7423e52))
* allow using integers as id ([2042f72](https://github.com/open-rpc/client-js/commit/2042f72))
* cleanup vars ([72debcf](https://github.com/open-rpc/client-js/commit/72debcf))
* deterministic id and cleanup ([097c960](https://github.com/open-rpc/client-js/commit/097c960))
* event emitter transport ([ba1e23b](https://github.com/open-rpc/client-js/commit/ba1e23b))
* improve coverage ([5496caf](https://github.com/open-rpc/client-js/commit/5496caf))
* improve coverage on index ([8bcf352](https://github.com/open-rpc/client-js/commit/8bcf352))
* improve test coverage ([7e59301](https://github.com/open-rpc/client-js/commit/7e59301))
* mocking ([586ef40](https://github.com/open-rpc/client-js/commit/586ef40))
* more specific assertion ([374beb3](https://github.com/open-rpc/client-js/commit/374beb3))
* **README:** WebSocket casing ([10387e5](https://github.com/open-rpc/client-js/commit/10387e5))
* move semantic deps to circle ([e3a2003](https://github.com/open-rpc/client-js/commit/e3a2003))
* refactor request manager connect ([ea19ecf](https://github.com/open-rpc/client-js/commit/ea19ecf))
* request manager tests ([8ba714e](https://github.com/open-rpc/client-js/commit/8ba714e))
* update src/RequestManager.test.ts ([617e2ed](https://github.com/open-rpc/client-js/commit/617e2ed))


### Features

* batching ([5cc5887](https://github.com/open-rpc/client-js/commit/5cc5887))

## [1.0.1](https://github.com/open-rpc/client-js/compare/1.0.0...1.0.1) (2019-05-21)


### Bug Fixes

* add badges ([41a87f1](https://github.com/open-rpc/client-js/commit/41a87f1))
* error support ([2d91e5a](https://github.com/open-rpc/client-js/commit/2d91e5a))
* return early if no req ([5e2dab2](https://github.com/open-rpc/client-js/commit/5e2dab2))
* use object for error ([efd0f61](https://github.com/open-rpc/client-js/commit/efd0f61))

# 1.0.0 (2019-05-15)


### Bug Fixes

* add [@example](https://github.com/example) typedoc tag to Client ([5158252](https://github.com/open-rpc/client-js/commit/5158252))
* add code example ([094df9c](https://github.com/open-rpc/client-js/commit/094df9c))
* add link to jenkins pipelines ([0e67bb1](https://github.com/open-rpc/client-js/commit/0e67bb1))
* add simple example ([3b3aaf6](https://github.com/open-rpc/client-js/commit/3b3aaf6))
* add test coverage + circleci ([e0ffac0](https://github.com/open-rpc/client-js/commit/e0ffac0))
* add video guide for making small documentation changes ([87df9a8](https://github.com/open-rpc/client-js/commit/87df9a8))
* change Client example url ([588c8ba](https://github.com/open-rpc/client-js/commit/588c8ba))
* CONTRIBUTING formatting and typo ([c1ef029](https://github.com/open-rpc/client-js/commit/c1ef029))
* conventional commits typo ([423df0e](https://github.com/open-rpc/client-js/commit/423df0e))
* delete extra license ([0c506ff](https://github.com/open-rpc/client-js/commit/0c506ff))
* extra backtick ([6939b17](https://github.com/open-rpc/client-js/commit/6939b17))
* formatting + README + extra connection null checks ([e0b3057](https://github.com/open-rpc/client-js/commit/e0b3057))
* gitignore need not use . in path ([64a8808](https://github.com/open-rpc/client-js/commit/64a8808))
* indenting ([835583d](https://github.com/open-rpc/client-js/commit/835583d))
* initial setup + tests ([5ab3881](https://github.com/open-rpc/client-js/commit/5ab3881))
* initial transport implementation ([e3e3c6a](https://github.com/open-rpc/client-js/commit/e3e3c6a))
* initial transport implementation ([e5cb09f](https://github.com/open-rpc/client-js/commit/e5cb09f))
* move conventions and resource up in the readme ([227b53a](https://github.com/open-rpc/client-js/commit/227b53a))
* move to pristine ([988ae60](https://github.com/open-rpc/client-js/commit/988ae60))
* remove null checks on Event Emitter ([d677e0b](https://github.com/open-rpc/client-js/commit/d677e0b))
* remove unneeded null checks ([5cfad43](https://github.com/open-rpc/client-js/commit/5cfad43))
* remove unused jenkins and testing files ([cfed249](https://github.com/open-rpc/client-js/commit/cfed249))
* remove yaml in example ([b410975](https://github.com/open-rpc/client-js/commit/b410975))
* Rename LICENSE -> LICENSE.md ([22ed02d](https://github.com/open-rpc/client-js/commit/22ed02d))
* replace github for Github ([b6b9d42](https://github.com/open-rpc/client-js/commit/b6b9d42))
* set onData to private ([992c73d](https://github.com/open-rpc/client-js/commit/992c73d))
* stricter typings + typedoc comments ([b4e9698](https://github.com/open-rpc/client-js/commit/b4e9698))
* typo in CONTRIBUTING.md and compose command in BUILDING.md ([783905c](https://github.com/open-rpc/client-js/commit/783905c))
* update .gitignore ([d7107cc](https://github.com/open-rpc/client-js/commit/d7107cc))
* update BUILDING.md ([b0e9d5d](https://github.com/open-rpc/client-js/commit/b0e9d5d))
* update BUILDING.md typo ([0b21631](https://github.com/open-rpc/client-js/commit/0b21631))
* update CONTRIBUTING.md adding docs ([b324d84](https://github.com/open-rpc/client-js/commit/b324d84))
* update CONTRIBUTING.md choppy code changes and testing ([ad1e78a](https://github.com/open-rpc/client-js/commit/ad1e78a))
* update CONTRIBUTING.md grammer around preview markdown ([38c9abf](https://github.com/open-rpc/client-js/commit/38c9abf))
* **building:** add definitions section ([b8bd636](https://github.com/open-rpc/client-js/commit/b8bd636))
* update CONTRIBUTING.md how to fork a repo ([74dfe4f](https://github.com/open-rpc/client-js/commit/74dfe4f))
* update CONTRIBUTING.md period ([0c9e6e1](https://github.com/open-rpc/client-js/commit/0c9e6e1))
* **building:** remove unneeded definitions ([718cd97](https://github.com/open-rpc/client-js/commit/718cd97))
* update CONTRIBUTING.md to get rid of cloning or forking ([af142a2](https://github.com/open-rpc/client-js/commit/af142a2))
* update CONTRIBUTING.md typo ([3ebf183](https://github.com/open-rpc/client-js/commit/3ebf183))
* update README.md simplify open source grammar ([e892afe](https://github.com/open-rpc/client-js/commit/e892afe))
* update README.md typo its ([cdf5389](https://github.com/open-rpc/client-js/commit/cdf5389))
* wording change ([3b6b60b](https://github.com/open-rpc/client-js/commit/3b6b60b))


### Features

* add choose a license to resources ([1e38132](https://github.com/open-rpc/client-js/commit/1e38132))
* add info on using this repo ([1671d3e](https://github.com/open-rpc/client-js/commit/1671d3e))
* add issue templates ([5bc409d](https://github.com/open-rpc/client-js/commit/5bc409d))
* add Jenkinsfile ([2d9a5e4](https://github.com/open-rpc/client-js/commit/2d9a5e4))
* add more resources to README ([bb5b213](https://github.com/open-rpc/client-js/commit/bb5b213))
* add resources for documentation driven development ([94c6214](https://github.com/open-rpc/client-js/commit/94c6214))
* add testing.md file ([ed3781a](https://github.com/open-rpc/client-js/commit/ed3781a))
* initial commit ([de17561](https://github.com/open-rpc/client-js/commit/de17561))
* update release to be more specific ([ba46d70](https://github.com/open-rpc/client-js/commit/ba46d70))
