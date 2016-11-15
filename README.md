# Molecular Design Applications

Predictive molecular modeling applications based on the [Molecular Design Toolkit](https://github.com/Autodesk/molecular-design-toolkit) framework. (Early development, all features are subject to change)

## Installation

After cloning the repo:

	git submodule update --init --recursive

Then run:

	./bin/run-local

Then open your browser to  [http://localhost:4000](http://localhost:4000)

## Modify the gallery

Edit server/test/examples/workflow1/example_workflow.yml and reload the web page to see the new gallery nodes.


## Developers

	./bin/run-local-dev

This mounts local source code so that modifications or re-compilations will cause servers to restart.



## Contributing
This project is developed and maintained by the [Molecular Design Toolkit](https://github.com/autodesk/molecular-design-toolkit) project. Please see that project's [CONTRIBUTING document](https://github.com/autodesk/molecular-design-toolkit/CONTRIBUTING.md) for details.


## License

Copyright 2016 Autodesk Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
