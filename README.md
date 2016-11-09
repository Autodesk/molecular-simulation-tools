# Cloud Workflow Prototype

After cloning the repo:

	git submodule update --init --recursive

Add the following to client/.env:

    NODE_ENV=production
    API_URL=http://localhost:8765

Then run:

	./bin/run-local

Then open your browser to  [http://localhost:4000](http://localhost:4000)

## Modify the gallery

Edit server/test/examples/workflow1/example_workflow.yml and reload the web page to see the new gallery nodes.


## Developers

	./bin/run-local-dev

This mounts local source code so that modifications or re-compilations will cause servers to restart.


