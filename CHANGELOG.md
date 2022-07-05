## [1.7.1](https://github.com/open-rpc/client-js/compare/1.7.0...1.7.1) (2021-08-20)


### Bug Fixes

* correct mem leaks caused by notification promise resolution ([5e425e0](https://github.com/open-rpc/client-js/commit/5e425e06c845e207420c73d8d23963330b9b4ab9)), closes [#294](https://github.com/open-rpc/client-js/issues/294)

# [1.7.0](https://github.com/open-rpc/client-js/compare/1.6.3...1.7.0) (2021-05-28)


### Features

* support custom requestID generation ([e512bd5](https://github.com/open-rpc/client-js/commit/e512bd579b7a342609f842b7e60eb17d217816b7)), closes [#277](https://github.com/open-rpc/client-js/issues/277) [#279](https://github.com/open-rpc/client-js/issues/279)

## [1.6.3](https://github.com/open-rpc/client-js/compare/1.6.2...1.6.3) (2021-04-08)


### Bug Fixes

* remove ev origin guard for postmessage + ignore non JSON-RPC messages ([ef2dc2f](https://github.com/open-rpc/client-js/commit/ef2dc2fb92b4d67a2f03a040112c09e5dc47d48d))

## [1.6.2](https://github.com/open-rpc/client-js/compare/1.6.1...1.6.2) (2020-12-17)


### Bug Fixes

* **RequestManager:** ignore missing id ([6bc8116](https://github.com/open-rpc/client-js/commit/6bc811608a362ab8dfa17280de731284a141f4fd))
* jsonrpc error instanceof ([c85f501](https://github.com/open-rpc/client-js/commit/c85f501f7e19c5313f388f8a2bcaf36cf491fea2)), closes [#209](https://github.com/open-rpc/client-js/issues/209)
* this corrects default timeout to be disabled by specifing null. ([c79d213](https://github.com/open-rpc/client-js/commit/c79d2130dfd204a535103ec0082540e4c11669a7)), closes [#231](https://github.com/open-rpc/client-js/issues/231)

## [1.6.1](https://github.com/open-rpc/client-js/compare/1.6.0...1.6.1) (2020-12-07)


### Bug Fixes

* remove postemsasgeiframe listener on close ([907dd0d](https://github.com/open-rpc/client-js/commit/907dd0ded8c34925052559f9c5b2c3659e4f437e))

# [1.6.0](https://github.com/open-rpc/client-js/compare/1.5.2...1.6.0) (2020-10-19)


### Bug Fixes

* **Client:** add close test ([0139391](https://github.com/open-rpc/client-js/commit/01393916731d12195a7719784467aee8ef48cb4c))


### Features

* add `close` method Client to close connection and cleanup event listeners ([0155c81](https://github.com/open-rpc/client-js/commit/0155c8109edf1ffc6508de3125072afc418de8b4))

## [1.5.2](https://github.com/open-rpc/client-js/compare/1.5.1...1.5.2) (2020-10-09)


### Bug Fixes

* npm audit fix ([6202a28](https://github.com/open-rpc/client-js/commit/6202a28d09846b6a74eeebe0e009a802721cd182))

## [1.5.1](https://github.com/open-rpc/client-js/compare/1.5.0...1.5.1) (2020-09-25)


### Bug Fixes

* remove PostMessage EventListener on close ([844af19](https://github.com/open-rpc/client-js/commit/844af195ac1098002630b68a309f03fe1a8e519c))

# [1.5.0](https://github.com/open-rpc/client-js/compare/1.4.0...1.5.0) (2020-08-03)


### Bug Fixes

* **README:** add postmessage transports to list ([adfa4b6](https://github.com/open-rpc/client-js/commit/adfa4b680c6b3f0010ed2d36ef622da4cc574d5b))


### Features

* add options to HTTPTransport constructor ([6f26276](https://github.com/open-rpc/client-js/commit/6f26276ff39b1544a378a8928b83c1a5531759d9))

# [1.4.0](https://github.com/open-rpc/client-js/compare/1.3.3...1.4.0) (2020-07-27)


### Bug Fixes

* **provider:** rename to ClientInterface ([3bfe849](https://github.com/open-rpc/client-js/commit/3bfe84981aa6e37395a732269085d744cef05f68))
* **provider:** type ([2124382](https://github.com/open-rpc/client-js/commit/21243827b0f6a8b035a117c86ef6a4946fef442b))
* add default export back ([d2b4dc2](https://github.com/open-rpc/client-js/commit/d2b4dc2d4b7e12d38b6b9947467e3a11d7f6ca22))
* remove duplicate JSONRpcError type ([be1669f](https://github.com/open-rpc/client-js/commit/be1669fc548b5e542c2b92a24730dfeecbefc4fe))
* **README:** change example interfaces ([6904bab](https://github.com/open-rpc/client-js/commit/6904bab4b534336778e117dd0a41abb22700b147))
* **README:** consistent naming ([40242fe](https://github.com/open-rpc/client-js/commit/40242fec0c4c4126744e748fe526bccea729ecb3))
* **README:** transport ordering ([5b52a17](https://github.com/open-rpc/client-js/commit/5b52a17a4c4271b1856b9abede7343ef5f1cc922))
* **typdoc:** add typedoc.jsosn and use library mode ([7f7c94c](https://github.com/open-rpc/client-js/commit/7f7c94cd793ca7441087ef1ddc91db8bef87205c))
* request manager requestObject type should be JSONRPCMessage ([5a3c194](https://github.com/open-rpc/client-js/commit/5a3c1949a7e03363c4c5809082ea304274817245))


### Features

* change public `request` interface to match provider ([bd33563](https://github.com/open-rpc/client-js/commit/bd33563e40e40464d94028f567f76bb5b297bd22))

## [1.3.3](https://github.com/open-rpc/client-js/compare/1.3.2...1.3.3) (2020-07-17)


### Bug Fixes

* **README:** add collapsed examples ([588bcba](https://github.com/open-rpc/client-js/commit/588bcbaa7bbb6f019fff6ed654c122212b8e360f))
* **README:** example formatting ([840857f](https://github.com/open-rpc/client-js/commit/840857f02c064bd9f8a96227c628eaabca7a8b29))
* add failing notification test ([a638062](https://github.com/open-rpc/client-js/commit/a638062d3870b2c93307db6dccc778265596f4f8))
* onNotification not firing bug ([0b62f9c](https://github.com/open-rpc/client-js/commit/0b62f9cdb431e1cd2d79c6b2ff0fadd38426e918))

## [1.3.2](https://github.com/open-rpc/client-js/compare/1.3.1...1.3.2) (2020-07-17)


### Bug Fixes

* correct order of req/res uri for event emitter ([0e5ca00](https://github.com/open-rpc/client-js/commit/0e5ca00075b26007d570aa35299c49e3c46f8dde)), closes [#190](https://github.com/open-rpc/client-js/issues/190) [#188](https://github.com/open-rpc/client-js/issues/188)

## [1.3.1](https://github.com/open-rpc/client-js/compare/1.3.0...1.3.1) (2020-06-24)


### Bug Fixes

* break out postmessage into 2 transports ([2db3289](https://github.com/open-rpc/client-js/commit/2db32895e0909c24ae09250b5774b0b59cdd9555))
* naming + use random port for tests/ci ([6b7ad0c](https://github.com/open-rpc/client-js/commit/6b7ad0c2600d23229a0094c0a2204a87db2ad8aa))

# [1.3.0](https://github.com/open-rpc/client-js/compare/1.2.5...1.3.0) (2020-06-11)


### Bug Fixes

* **postmessage:** add iframe support ([893c0b8](https://github.com/open-rpc/client-js/commit/893c0b8cd3820ccb56561974b17b04704ec5fab7))
* **PostMessage:** exports ([0df7146](https://github.com/open-rpc/client-js/commit/0df71464c5b63f65aa19a1a497595a7ddbf2c577))
* latest wip ([bce6627](https://github.com/open-rpc/client-js/commit/bce66278a6d872c93a60370def60234f90552809))
* refactor to createWindow + get tests passing ([6b61cac](https://github.com/open-rpc/client-js/commit/6b61caca951927ea154ad4720be3e119809f5db4))


### Features

* postmessage transport ([0d9e646](https://github.com/open-rpc/client-js/commit/0d9e64604f3a96967e55070c87787547f6f0d049))

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
