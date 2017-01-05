# Molecular Design Applications

Predictive molecular modeling applications based on the [Molecular Design Toolkit](https://github.com/Autodesk/molecular-design-toolkit) framework. (Early development, all features are subject to change)

## Steps to run:

	git clone https://github.com/Autodesk/molecular-design-applications
	cd molecular-design-applications
	git submodule update --init --recursive
	docker-compose up

Then open your browser to  [http://localhost:4000](http://localhost:4000)

## Development

### Client

See client/README.md

### Server

	node server/server.js

APIs:

	GET workflow/state/:workflowId
		Will be one of [none|running|finished|failed]

	POST workflow/run
		Two fields/files required for this multipart request:
		email
		input.json

	GET workflow/stdout/:workflowId
		Returns the stdout logs of the finished workflow

	GET workflow/stderr/:workflowId
		Returns the stderr logs of the finished workflow

	GET workflow/exitcode/:workflowId
		Returns the exit code of the finished workflow

#### Seed Data
Currently, Redis needs to be seeded with at least one workflow for the app to use, which you can create with:

    hset workflows 0 '{"id": 0, "title": "VDE"}'

### Developing frontend assets
In addition to mounting local directories as mentioned above, you can recompile the frontend assets on change by running `npm run watch` in the client directory.

## Contributing
This project is developed and maintained by the [Molecular Design Toolkit](https://github.com/autodesk/molecular-design-toolkit) project. Please see that project's [CONTRIBUTING document](https://github.com/autodesk/molecular-design-toolkit/CONTRIBUTING.md) for details.


## License

Copyright 2016 Autodesk Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
