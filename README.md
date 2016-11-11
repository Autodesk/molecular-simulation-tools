# Cloud Workflow Prototype

After cloning the repo:

	git submodule update --init --recursive

Then create the mdt image

	cd client/workflow_convert_pdb
	docker build -t mdtscripts .

Then run:

	docker-compose up

Then open your browser to  [http://localhost:4000](http://localhost:4000)

Local server and client and workflow development can be sped up by mounting local directories, see docker-compose.yml for what volume mounts to uncomment and then restatt the docker-compose command.
