# Workflow Web Server
This workflow serves the API for the web app frontend and also communicates with the workflow execution server.

## API
Routes are behind a version prefix, which is currently "/v1".

### GET /workflow/:workflowId
Returns the indicated workflow.
